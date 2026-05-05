import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, createTrashCollector, trasher } from './testassist.js';

export const testSlidesColorScheme = (pack) => {
  const toTrash = createTrashCollector();
  const { unit, fixes } = pack || initTests();

  unit.section('ColorScheme class methods', (t) => {
    const presName = `gas-fakes-test-colorscheme-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    // In Live GAS, there is no Presentation.getColorScheme(). 
    // We must get the color scheme from a Master, Layout, or Slide.
    const master = pres.getMasters()[0];
    const colorScheme = master.getColorScheme();
    t.is(colorScheme.toString(), 'ColorScheme', 'getColorScheme() should return a ColorScheme');

    // getThemeColors()
    const themeColors = colorScheme.getThemeColors();
    t.true(themeColors.length > 0, 'getThemeColors() should return a list of theme color types');
    // Check for some standard types
    const types = themeColors.map(tc => tc.toString());
    t.true(types.includes('ACCENT1'), 'Theme colors should include ACCENT1');
    t.true(types.includes('DARK1'), 'Theme colors should include DARK1');

    // getConcreteColor()
    const accent1 = colorScheme.getConcreteColor(SlidesApp.ThemeColorType.ACCENT1);
    t.is(accent1.toString(), 'Color', 'getConcreteColor() should return a Color');
    t.is(accent1.getColorType().toString(), 'RGB', 'Initial concrete color should be RGB');

    // setConcreteColor()
    // Let's set ACCENT1 to a specific color using the Hex String overload, 
    // as Live GAS does not allow passing SpreadsheetApp.Color objects to SlidesApp methods.
    colorScheme.setConcreteColor(SlidesApp.ThemeColorType.ACCENT1, '#ff0000');

    // Verify change
    const updatedAccent1 = colorScheme.getConcreteColor(SlidesApp.ThemeColorType.ACCENT1);
    t.is(updatedAccent1.asRgbColor().asHexString(), '#FF0000', 'ACCENT1 should be updated to #FF0000');

    // Test on a Slide
    const slide = pres.getSlides()[0];
    const slideColorScheme = slide.getColorScheme();
    t.is(slideColorScheme.toString(), 'ColorScheme', 'Slide.getColorScheme() should return a ColorScheme');
    
    const slideAccent1 = slideColorScheme.getConcreteColor(SlidesApp.ThemeColorType.ACCENT1);
    t.is(slideAccent1.asRgbColor().asHexString(), '#FF0000', 'Slide should inherit the updated color scheme from master');

    // Test on a Layout
    const layout = slide.getLayout();
    const layoutColorScheme = layout.getColorScheme();
    t.is(layoutColorScheme.getConcreteColor(SlidesApp.ThemeColorType.ACCENT1).asRgbColor().asHexString(), '#FF0000', 'Layout should inherit the updated color scheme');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesColorScheme);
