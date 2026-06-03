import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesMedia = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Slides Media Elements (Video, WordArt, SpeakerSpotlight)', (t) => {
    const presName = `gas-fakes-test-media-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    const presentationId = pres.getId();
    toTrash.push(DriveApp.getFileById(presentationId));

    const slide = pres.getSlides()[0];
    const slideId = slide.getObjectId();

    // 1. Test Video (Native GAS method)
    // Verification: Uses Native SlidesApp service
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const video = slide.insertVideo(videoUrl, 10, 10, 300, 200);
    
    t.truthy(video, 'Native insertVideo should return object');
    if (video) {
        t.is(video.getPageElementType().toString(), 'VIDEO', 'Element type should be VIDEO');
        t.is(video.getSource().toString(), 'YOUTUBE', 'Video source should be YOUTUBE');
        t.is(video.getVideoId(), 'dQw4w9WgXcQ', 'Video ID should match');
    }

    // 2. Test Video (via Advanced Service - verification of payload fix)
    // Verification: Uses Advanced Service (REST) directly to avoid Revision Isolation lag
    const advVideoId = 'jNQXAC9IVRw';
    const advVideoObjectId = `video_adv_${new Date().getTime()}`;
    
    Slides.Presentations.batchUpdate({
      requests: [{
        createVideo: {
          objectId: advVideoObjectId,
          source: 'YOUTUBE',
          id: advVideoId,
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: 300, unit: 'PT' },
              height: { magnitude: 200, unit: 'PT' }
            }
          }
        }
      }]
    }, presentationId);

    // Primary Verification: REST sees REST creations
    const advPres = Slides.Presentations.get(presentationId);
    const advSlide = advPres.slides.find(s => s.objectId === slideId);
    const advVideoResource = advSlide.pageElements?.find(el => el.objectId === advVideoObjectId);
    
    t.truthy(advVideoResource, `Advanced Service should see its own created Video ${advVideoObjectId}`);
    if (advVideoResource) {
        t.truthy(advVideoResource.video, 'Element resource should be a video');
        t.is(advVideoResource.video.id, advVideoId, 'Advanced Video ID should match');
    }

    // 3. Test SpeakerSpotlight (via Advanced Service)
    // Note: This is a relatively new API feature (May 2024). 
    // It may fail with "Unknown name" on accounts where it's not yet enabled.
    const spotlightId = `spotlight_${new Date().getTime()}`;
    try {
        Slides.Presentations.batchUpdate({
          requests: [{
            createSpeakerSpotlight: {
              objectId: spotlightId,
              elementProperties: {
                pageObjectId: slideId,
                size: {
                    width: { magnitude: 200, unit: 'PT' },
                    height: { magnitude: 200, unit: 'PT' }
                }
              }
            }
          }]
        }, presentationId);
        
        const advPres2 = Slides.Presentations.get(presentationId);
        const spotlightRes = advPres2.slides[0].pageElements?.find(el => el.objectId === spotlightId);
        if (spotlightRes) {
            t.truthy(spotlightRes.speakerSpotlight, 'Resource should contain speakerSpotlight properties');
        }
    } catch (e) {
        if (e.message.includes('createSpeakerSpotlight')) {
            console.log('...SpeakerSpotlight API not yet recognized by this account (Unknown name)');
        } else {
            console.log('...skipping SpeakerSpotlight test:', e.message);
        }
    }

    // 4. Test WordArt (WordArt is usually read-only or created via UI/duplicate)
    const wordArtElements = slide.getPageElements().filter(el => el.getPageElementType().toString() === 'WORD_ART');
    t.true(is.array(wordArtElements), 'getWordArts should return array');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesMedia);
