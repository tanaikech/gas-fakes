
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesAffineTransform = (pack) => {
  const { unit, fixes } = pack || initTests();

  unit.section('AffineTransform and Builder', (t) => {

    const builder = SlidesApp.newAffineTransformBuilder();
    t.truthy(builder, 'Should create a builder');
    t.is(builder.toString(), 'AffineTransformBuilder', 'Builder toString check');

    builder.setScaleX(2.0)
      .setScaleY(3.0)
      .setShearX(0.5)
      .setShearY(0.1)
      .setTranslateX(100.0)
      .setTranslateY(200.0);

    const transform = builder.build();
    t.truthy(transform, 'Should build a transform');
    t.is(transform.toString(), 'AffineTransform', 'Transform toString check');

    t.is(transform.getScaleX(), 2.0, 'ScaleX check');
    t.is(transform.getScaleY(), 3.0, 'ScaleY check');
    t.is(transform.getShearX(), 0.5, 'ShearX check');
    t.is(transform.getShearY(), 0.1, 'ShearY check');
    t.is(transform.getTranslateX(), 100.0, 'TranslateX check');
    t.is(transform.getTranslateY(), 200.0, 'TranslateY check');

    const builder2 = transform.toBuilder();
    t.truthy(builder2, 'Should create builder from transform');

    const transform2 = builder2.build();
    t.is(transform2.getScaleX(), 2.0, 'Preserved values check');
    t.is(transform2.getTranslateX(), 100.0, 'Preserved values check');

  });

  if (!pack) {
    unit.report();
  }
  return { unit, fixes };
};

wrapupTest(testSlidesAffineTransform);
