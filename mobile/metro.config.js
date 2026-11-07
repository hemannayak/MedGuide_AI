const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const existing = config.resolver.blockList;

// Native compiler outputs are never JavaScript inputs. Scanning them also
// revisits large CMake dependency trees while Android builds are running.
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  /[\\/]android[\\/](?:app[\\/])?(?:build|\.gradle|\.cxx(?:\.[^\\/]+)?)(?:[\\/]|$)/,
];

module.exports = config;
