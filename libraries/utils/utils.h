
#ifndef __UTILS_H__
#define __UTILS_H__

#include "Adafruit_WS2801.h"

void oneColor(Adafruit_WS2801 &strip, uint32_t c);

// Create a 24 bit color value from R,G,B
uint32_t C(byte r, byte g, byte b);

void setArray(Adafruit_WS2801 &strip, uint32_t arr[]);

#endif