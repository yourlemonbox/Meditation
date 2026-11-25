import {Config} from '@remotion/cli/config';

// Master delivery settings: H.264 MP4, high quality, 4:2:0 for broad playback.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);

// Optional: use a pre-installed Chrome/Chromium headless shell instead of
// Remotion's auto-downloaded one (useful in sandboxes without that download).
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
