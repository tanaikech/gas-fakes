import got from 'got';

const url = 'https://developers.google.com/apps-script/reference/document';

got(url).then(response => {
  console.log(response.body);
}).catch(err => {
  console.error(err);
});
