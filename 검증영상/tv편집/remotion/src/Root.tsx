import React from 'react';
import {Composition} from 'remotion';
import {SajuAd, FPS, TOTAL_FRAMES} from './SajuAd';
import {KokAd, OrumAd, KOK_FRAMES, ORUM_FRAMES} from './SongAds';

export const Root: React.FC = () => (
  <>
    <Composition id="SajuAd" component={SajuAd} durationInFrames={TOTAL_FRAMES} fps={FPS} width={720} height={1280} defaultProps={{mode: 'custom' as const}} />
    <Composition id="SajuAdTikTok" component={SajuAd} durationInFrames={TOTAL_FRAMES} fps={FPS} width={720} height={1280} defaultProps={{mode: 'tiktok' as const}} />
    <Composition id="SajuAdCapTikTok" component={SajuAd} durationInFrames={TOTAL_FRAMES} fps={FPS} width={720} height={1280} defaultProps={{mode: 'cap-tiktok' as const}} />
    <Composition id="SajuAdCapShorts" component={SajuAd} durationInFrames={TOTAL_FRAMES} fps={FPS} width={720} height={1280} defaultProps={{mode: 'cap-shorts' as const}} />
    <Composition id="SajuAdSubBounce" component={SajuAd} durationInFrames={TOTAL_FRAMES} fps={FPS} width={720} height={1280} defaultProps={{mode: 'sub-bounce' as const}} />
    <Composition id="SajuAdTikTokAll" component={SajuAd} durationInFrames={TOTAL_FRAMES} fps={FPS} width={720} height={1280} defaultProps={{mode: 'tiktok-all' as const}} />
    <Composition id="KokAd" component={KokAd} durationInFrames={KOK_FRAMES} fps={FPS} width={720} height={1280} />
    <Composition id="OrumAd" component={OrumAd} durationInFrames={ORUM_FRAMES} fps={FPS} width={720} height={1280} />
  </>
);
