#ifndef __COLOR_ARRAY_H__
#define __COLOR_ARRAY_H__

#include "Adafruit_WS2801.h"

class ColorArray {
  public:
    ColorArray(int count, ...);
    ColorArray* inc();
    ColorArray* add(uint32_t step);

    ColorArray& operator++();
    // ColorArray operator++(int);
    ~ColorArray();

    uint32_t curColor();
  private:
  	ColorArray* setColorIdx(uint32_t idx);
  	ColorArray* incColor();
  	uint32_t count(uint32_t idx);
  	uint32_t color(uint32_t idx);

  	uint32_t* arr;
  	uint32_t numColors, curColorIdx, curIntraColorIdx, curColorCount;
};

#endif
