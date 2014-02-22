
#ifndef __STRIP_H__
#define __STRIP_H__

#include "Adafruit_WS2801.h"

class Strip {
public:
	Strip();
	~Strip();

	void clear();

	void show(bool shouldPrint = false);

	Strip* setColor(uint32_t color);
	Strip* setColors(uint32_t colors[]);
	Strip* setColor(uint32_t color, double intensities[]);
	Strip* setColors(uint32_t colors[], double intensities[]);

	Strip* rotate(int step);
	Strip* blendRight(int diffusion = 1);
	void print();

	void begin() { this->strip->begin(); }

	static void printColor(uint32_t color, bool newLine = false);
	Adafruit_WS2801* strip;
	uint32_t* pixels;
private:

	uint32_t sanitizeStep(int step);

	uint32_t length;

	// Choose which 2 pins you will use for output.
	// Can be any valid output pins.
	// The colors of the wires may be totally different so
	// BE SURE TO CHECK YOUR PIXELS TO SEE WHICH WIRES TO USE!
	static const uint8_t dataPin  = 2;    // Yellow wire on Adafruit Pixels
	static const uint8_t clockPin = 3;    // Green wire on Adafruit Pixels

};

#endif
