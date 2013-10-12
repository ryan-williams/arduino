
#ifndef __UTILS_H__
#define __UTILS_H__

#include "Adafruit_WS2801.h"

void oneColor(Adafruit_WS2801 &strip, uint32_t c);

// Create a 24 bit color value from R,G,B
uint32_t C(byte r, byte g, byte b);

uint32_t CI(byte r, byte g, byte b, double i);
uint32_t CI(uint32_t c, double i);

void setArray(Adafruit_WS2801 &strip, uint32_t arr[]);
void setArray(Adafruit_WS2801 &strip, uint32_t color, double intensities[]);

void rot(double arr[], uint32_t length, uint32_t step);

void print(double arr[], uint32_t length);

class ColorArray {

};

class IntensityArray {

};



#endif