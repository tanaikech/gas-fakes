# Подтверждение концепции реализации среды Apps Script на Node

Я использую clasp/vscode для разработки приложений Google Apps Script (GAS), но при использовании нативных сервисов GAS возникает слишком много переходов туда-сюда к IDE GAS во время тестирования. Я поставил себе цель реализовать фейковую версию среды выполнения GAS на Node, чтобы хотябы сделать тесты локально.

Это всего лишь демонстрационная реализация, поэтому я реализовал очень ограниченное количество сервисов и методов, но все сложные части уже на месте, так что остается только много рутинной работы (к которой я с энтузиазмом приглашаю любых заинтересованных соавторов).

## Начало работы

You can get the package from npm

```sh
npm i @mcpher/gas-fakes
```

Идея заключается в том, что вы можете запускать локально на Node сервисы GAS (пока только те, что реализованны), и он (Node) будет использовать различные API Google Workspace для эмуляции того, что произошло бы, если бы вы запустили то же самое в среде GAS.

### Облачный проект

У вас нет доступа к облачному проекту, поддерживаемому GAS, поэтому вам нужно создать проект GCP для использования локально. Чтобы продублировать управление OAuth, обрабатываемое GAS, мы будем использовать Application Default Credentials. В этом репозитории есть некоторые скрипты для настройки и тестирования этих данных. Как только вы настроите облачный проект, перейдите в папку `shells` и добавьте свой `project id` в `setaccount.sh` и

### Тестируйте

Рекомендую использовать тестовый проект, включенный в репозиторий, чтобы убедиться, что все настроено правильно. Он использует Fake DriveApp service для проверки Auth и т.д. Просто измените преднастройки на значения, присутствующие в вашем собственном Диске, затем `npm i && npm test`. Обратите внимание, что я использую [юнит-тестировщик](https://ramblings.mcpher.com/apps-script-test-runner-library-ported-to-node/), который работает как в GAS, так и в Node, поэтому те же самые тесты будут выполняться в обоих средах.

### Передача в GAS

Скрипт `togas.sh` переместит ваши файлы в gas - просто установите папки `SOURCE` и `TARGET` в скрипте. Убедитесь, что у вас есть манифест `appsscript.json` в папке `SOURCE`, поскольку **gas-fakes** читает его для обработки OAuth на Node.

Вы можете написать проект, который будет работать на Node и вызывать сервисы GAS, и он также будет работать в среде GAS без изменений кода, за исключением того, что на стороне Node у вас есть этот один импорт

```js
// all the fake services are here
import '@mcpher/gas-fakes/main.js'
```

`togas.sh` удалит `imports` и `exports` по пути к Apps Script, который их не поддерживает.

## Подход

Google не опубликовали детали о среде исполнения GAS (насколько мне известно). Мы знаем то, что они раньше работали на эмуляторе JavaScript под названием [Rhino](https://ramblings.mcpher.com/gassnippets2/what-javascript-engine-is-apps-script-running-on/), основанном на Java, но несколько лет назад перешели на среду исполнения V8. Помимо этого, мы не знаем почти ничего, кроме того, что они работают где-то на серверах Google.

Было 3 основные сложные проблемы, которые нужно было преодолеть, чтобы это заработало

- GAS полностью синхронный, тогда как замена вызовов API Workspace на Node асинхронная.
- GAS автоматически обрабатывает инициализацию OAuth из файла манифеста, тогда как нам нужна дополнительный код или альтернативные подходы на Node.
- Сервисные синглтоны (например, DriveApp) автоматически инициализируются и доступны в глобальном пространстве имен, тогда как в Node им нужна некоторая пост-AUTH инициализация, упорядочивание инициализации и экспозиция.
- Итераторы GAS не такие же, как стандартные итераторы, так как у них есть метод `hasNext()` и они не ведут себя одинаково.

Помимо этого, реализация - это просто много рутинной работы. Вот как я справился с этими 3 проблемами.

### Синхронность против Асинхронности

Хотя Apps Script поддерживает синтаксис async/await/promise, он работает в блокирующем режиме. Я действительно не хотел настаивать на асинхронном кодировании в коде, ориентированном на GAS, поэтому мне нужно было найти способ эмулировать то, что, вероятно, делает среда GAS.

Так как асинхронность является фундаментальной для Node, нет простого способа преобразовать асинхронность в синхронность. Однако существует такое понятие как *[child-process](https://nodejs.org/api/child_process.html#child-process)*, который вы можете запустить для выполнения вещей, и он имеет метод [`execSync`](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options), который задерживает возврат из дочернего процесса до тех пор, пока очередь переданного обещания не будет полностью завершена. Таким образом, самым простым решением является запуск асинхронного метода в дочернем процессе, ожидание его завершения и возврат результатов синхронно. Я обнаружил, что [Sindre Sorhus](https://github.com/sindresorhus) использует этот подход с [make-synchronous](https://github.com/sindresorhus/make-synchronous), поэтому и я использую это.

Вот простой пример того, как получить информацию о токене доступа синхронно

```js
/**
 * a sync version of token checking
 * @param {string} token the token to check
 * @returns {object} access token info
 */
const fxCheckToken = (accessToken) => {

  // now turn all that into a synchronous function - it runs as a subprocess, so we need to start from scratch
  const fx = makeSynchronous(async accessToken => {
    const { default: got } = await import('got')
    const tokenInfo = await got(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`).json()
    return tokenInfo
  })

  const result = fx(accessToken)
  return result
}
```

### OAuth

Здесь мы имеем два компонента решения.

#### Приложение с параметрами доступа по умолчанию / Application default credentials (ADC)

Чтобы избежать большого количества специфичного для Node кода и учетных данных, но все же обрабатывать OAuth, я решил, что мы можем просто полагаться на ADC. Это проблема, о которой я уже писал здесь [Application Default Credentials with Google Cloud and Workspace APIs](https://ramblings.mcpher.com/application-default-credentials-with-google-cloud-and-workspace-apis/)

Для настройки этого установите ID вашего проекта GCP и дополнительные области, которые вам нужны, в `shells/setaccount.sh`. В этом примере я сохраняю обычные области ADC и добавляю дополнительную область для доступа к Drive

```sh
# project ID
P=YOUR_GCP_PROJECT_ID

# config to activate - multiple configs can each be named
# here we're working on the default project configuration
AC=default

# these are the ones it sets by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/drive,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/sqlservice.login"

# these are the ones we want to add (note comma at beginning)
EXTRA_SCOPES=",https://www.googleapis.com/auth/drive"

.....etc
```

После настройки самого проекта вы можете выполнить скрипт, и это настроит ваш ADC, чтобы запускать любые службы, которым требуются области, которые вы добавили.

##### примечание

Хотя может быть искушение добавить `https://www.googleapis.com/auth/script.external_request`, это не обязательно для ADC и, на самом деле, вызовет ошибку. Конечно, вам понадобится это в вашем манифесте Apps script.

##### тестирование ADC

`shells/testtoken.sh` можно использовать для проверки, что вы можете сгенерировать токен с достаточной областью. В этом примере я проверяю, что могу получить доступ к файлу, которым владею. Измените `id` на один из ваших.

```sh
# check tokens have scopes required for DRIVE access
# set below to a fileid on drive you have access to
FILE_ID=SOME_FILE_ID

....etc
```

Рекомендую сделать это, чтобы убедиться, что Auth работает нормально, прежде чем начинать кодировать свое приложение.

#### Файл манифеста

**gas-fakes** читает файл манифеста, чтобы узнать, какие области вам нужны в проекте, использует библиотеку Google Auth для попытки авторизации и имеет `ScriptApp.getOauthToken()`, чтобы возвращать достаточно специфицированный токен, как это делает среда GAS. Просто убедитесь, что у вас есть `appsscript.json` в той же папке, что и ваш основной скрипт.

### Глобальная инициализация

Это было немного проблематично для реализации последовательности инициализации, но я хотел убедиться, что любые GAS сервисы, которые имитируются, доступны и инициализированы на стороне Node, как и в GAS. На момент написания (подмножество методов) этих сервисов реализовано.

v1.0.0 подтверждение концепции для

- `DriveApp`
- `ScriptApp`
- `UrlFetchApp`
- `Utilities`

#### Прокси и globalThis

Каждый сервис имеет `FakeClass`, но мне нужно было, чтобы цикл Auth был инициирован и выполнен перед тем, как сделать их публичными. Использование прокси был самым простым подходом.

Вот код для `ScriptApp`

```js
/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "ScriptApp"

if (typeof globalThis[name] === typeof undefined) {

  console.log ('setting script app to global')

  const getApp = () => {

    // if it hasn't been intialized yet then do that
    if (!_app) {
      
      // we also need to do the manifest scopes thing and the project id
      const projectId = Syncit.fxGetProjectId()
      const manifest = Syncit.fxGetManifest()
      Auth.setProjectId (projectId)
      Auth.setManifestScopes(manifest)

      _app = {
        getOAuthToken,
        requireAllScopes,
        requireScopes,
        AuthMode: {
          FULL: 'FULL'
        }
      }


    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }


  Proxies.registerProxy(name, getApp)

}
```

Вот как регистрируются прокси

```js

/**
 * diverts the property get to another object returned by the getApp function
 * @param {function} a function to get the proxy object to substitutes
 * @returns {function} a handler for a proxy
 */
const getAppHandler = (getApp) => {
  return {

    get(_, prop, receiver) {
      // this will let the caller know we're not really running in Apps Script 
      return (prop === 'isFake')  ? true : Reflect.get(getApp(), prop, receiver);
    },

    ownKeys(_) {
      return Reflect.ownKeys(getApp())
    }
  }
}

const registerProxy = (name, getApp) => {
  const value = new Proxy({}, getAppHandler(getApp))
  // add it to the global space to mimic what apps script does
  Object.defineProperty(globalThis, name, {
    value,
    enumerable: true,
    configurable: false,
    writable: false,
  });
}
```

Коротко говоря, сервис регистрируется как пустой объект, но при любой попытке получить доступ к нему фактически возвращает другой объект, который обрабатывает запрос. В примере `ScriptApp` является пустым объектом, но доступ к `ScriptApp.getOAuthToken()` возвращает объект ложный (Fake) `ScriptApp`, который был инициализирован.

Также есть тест, чтобы проверить, запущены ли вы в GAS или на Node - `ScriptApp.isFake`

### Итераторы

Итератор, созданный генератором, не имеет функции `hasNext()`, в то время как итераторы GAS имеют. Чтобы обойти это, мы можем создать обычный итератор Node, но ввести обертку, чтобы конструктор фактически получил первый элемент, а `next()` использовал значение, которое мы уже посмотрели. Вот обертка для преобразования итератора в стиль GAS

```js
import { Proxies } from './proxies.js'
/**
 * this is a class to add a hasnext to a generator
 * @class Peeker
 * 
 */
class Peeker {
  /**
   * @constructor 
   * @param {function} generator the generator function to add a hasNext() to
   * @returns {Peeker}
   */
  constructor(generator) {
    this.generator = generator
    // in order to be able to do a hasnext we have to actually get the value
    // this is the next value stored
    this.peeked = generator.next()
  }

  /**
   * we see if there's a next if the peeked at is all over
   * @returns {Boolean}
   */
  hasNext () {
    return !this.peeked.done
  }

  /**
   * get the next value - actually its already got and storef in peeked
   * @returns {object} {value, done}
   */
  next () {
    if (!this.hasNext()) {
      // TODO find out what driveapp does
      throw new Error ('iterator is exhausted - there is no more')
    }
    // instead of returning the next, we return the prepeeked next
    const value = this.peeked.value
    this.peeked = this.generator.next()
    return value
  }
}

export const newPeeker = (...args) => Proxies.guard(new Peeker (...args))
```

И пример использования, создающий итератор родителей из файла API Drive

```js
/**
 * this gets an intertor to fetch all the parents meta data
 * @param {FakeDriveMeta} {file} the meta data
 * @returns {object} {Peeker}
 */
const getParentsIterator = ({
  file
}) => {

  Utils.assert.object(file)
  Utils.assert.array(file.parents)

  function* filesink() {
    // the result tank, we just get them all by id
    let tank = file.parents.map(id => getFileById({ id, allow404: false }))

    while (tank.length) {
      yield newFakeDriveFolder(tank.splice(0, 1)[0])
    }
  }

  // create the iterator
  const parentsIt = filesink()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(parentsIt)

}
```

## Помощь

Как я уже упоминал ранее, чтобы развивать это дальше, мне понадобится много помощи для расширения поддерживаемых методов и сервисов - поэтому, если вы считаете, что это будет полезно для вас, и хотите сотрудничать, пожалуйста, свяжитесь со мной по [bruce@mcpher.com](mailto:bruce@mcpher.com) и мы поговорим.


## Translations and writeups

- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md) - colors supported by Apps Script
- [this file](README.md)
- [named colors](named-colors.md)
- [sandbox](sandbox.md)

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini-observations.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [using apps script libraries with gas-fakes](libraries.md)
- [how libhandler works](libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](named-range-identity.md)
- [adc and restricted scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [push test pull](pull-test-push.md)
- [gas fakes cli](gas-fakes-cli.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [Supercharge Your Google Apps Script Caching with GasFlexCache](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/)
- [Fake-Sandbox for Google Apps Script: Granular controls.](https://ramblings.mcpher.com/fake-sandbox-for-google-apps-script-granular-controls/)
- [A Fake-Sandbox for Google Apps Script: Securely Executing Code Generated by Gemini CLI](https://ramblings.mcpher.com/gas-fakes-sandbox/)
- [Power of Google Apps Script: Building MCP Server Tools for Gemini CLI and Google Antigravity in Google Workspace Automation](https://medium.com/google-cloud/power-of-google-apps-script-building-mcp-server-tools-for-gemini-cli-and-google-antigravity-in-71e754e4b740)
- [A New Era for Google Apps Script: Unlocking the Future of Google Workspace Automation with Natural Language](https://medium.com/google-cloud/a-new-era-for-google-apps-script-unlocking-the-future-of-google-workspace-automation-with-natural-a9cecf87b4c6)
- [Next-Generation Google Apps Script Development: Leveraging Antigravity and Gemini 3.0](https://medium.com/google-cloud/next-generation-google-apps-script-development-leveraging-antigravity-and-gemini-3-0-c4d5affbc1a8)
- [Modern Google Apps Script Workflow Building on the Cloud](https://medium.com/google-cloud/modern-google-apps-script-workflow-building-on-the-cloud-2255dbd32ac3)
- [Bridging the Gap: Seamless Integration for Local Google Apps Script Development](https://medium.com/@tanaike/bridging-the-gap-seamless-integration-for-local-google-apps-script-development-9b9b973aeb02)
- [Next-Level Google Apps Script Development](https://medium.com/google-cloud/next-level-google-apps-script-development-654be5153912)
- [Secure and Streamlined Google Apps Script Development with gas-fakes CLI and Gemini CLI Extension](https://medium.com/google-cloud/secure-and-streamlined-google-apps-script-development-with-gas-fakes-cli-and-gemini-cli-extension-67bbce80e2c8)
- [Secure and Conversational Google Workspace Automation: Integrating Gemini CLI with a gas-fakes MCP Server](https://medium.com/google-cloud/secure-and-conversational-google-workspace-automation-integrating-gemini-cli-with-a-gas-fakes-mcp-0a5341559865)
- [A Fake-Sandbox for Google Apps Script: A Feasibility Study on Securely Executing Code Generated by Gemini CL](https://medium.com/google-cloud/a-fake-sandbox-for-google-apps-script-a-feasibility-study-on-securely-executing-code-generated-by-cc985ce5dae3)
