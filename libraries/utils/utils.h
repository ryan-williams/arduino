
#ifndef __UTILS_H__
#define __UTILS_H__

#include "Adafruit_WS2801.h"

// void oneColor(Adafruit_WS2801 &strip, uint32_t c);

byte r(uint32_t c);
byte g(uint32_t c);
byte b(uint32_t c);

uint32_t R(uint32_t c);
uint32_t G(uint32_t c);
uint32_t B(uint32_t c);

// Create a 24 bit color value from R,G,B
uint32_t C(byte r, byte g, byte b);

uint32_t avg(uint32_t base, uint32_t next, uint32_t w1 = 1, uint32_t w2 = 1);

uint32_t CI(byte r, byte g, byte b, double i);
uint32_t CI(uint32_t c, double i);

#endif