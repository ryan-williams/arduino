
#include "Adafruit_WS2801.h"
#include "utils.h"

void oneColor(Adafruit_WS2801 &strip, uint32_t c) {
  for (int j = 0; j < strip.numPixels(); j++) {
    strip.setPixelColor(j, c);
  }
  strip.show();
}

// void oneColor(Adafruit_WS2801 &strip, unsigned long c) {
//   for (int j = 0; j < strip.numPixels(); j++) {
//     strip.setPixelColor(j, c);
//   }
//   strip.show();
// }
