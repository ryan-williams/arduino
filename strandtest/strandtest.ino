#include "SPI.h"
#include "Adafruit_WS2801.h"
#include "color_array.h"
#include <utils.h>

#include "strip.h"

// include core Wiring API
#include "Arduino.h"
// include description files for other libraries used (if any)
#include "HardwareSerial.h"

#include "macros.h"

/*****************************************************************************
Example sketch for driving Adafruit WS2801 pixels!


  Designed specifically to work with the Adafruit RGB Pixels!
  12mm Bullet shape ----> https://www.adafruit.com/products/322
  12mm Flat shape   ----> https://www.adafruit.com/products/738
  36mm Square shape ----> https://www.adafruit.com/products/683

  These pixels use SPI to transmit the color data, and have built in
  high speed PWM drivers for 24 bit color per pixel
  2 pins are required to interface

  Adafruit invests time and resources providing this open source code, 
  please support Adafruit and open-source hardware by purchasing 
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.  
  BSD license, all text above must be included in any redistribution

  *****************************************************************************/

// Choose which 2 pins you will use for output.
// Can be any valid output pins.
// The colors of the wires may be totally different so
// BE SURE TO CHECK YOUR PIXELS TO SEE WHICH WIRES TO USE!
// uint8_t dataPin  = 2;    // Yellow wire on Adafruit Pixels
// uint8_t clockPin = 3;    // Green wire on Adafruit Pixels
//
// Don't forget to connect the ground wire to Arduino ground,
// and the +5V wire to a +5V supply

// Set the first variable to the NUMBER of pixels. 25 = 25 pixels in a row
// Adafruit_WS2801 strip = Adafruit_WS2801(25, dataPin, clockPin);

// Optional: leave off pin numbers to use hardware SPI
// (pinout is then specific to each board and can't be changed)
//Adafruit_WS2801 strip = Adafruit_WS2801(25);

// For 36mm LED pixels: these pixels internally represent color in a
// different format.  Either of the above constructors can accept an
// optional extra parameter: WS2801_RGB is 'conventional' RGB order
// WS2801_GRB is the GRB order required by the 36mm pixels.  Other
// than this parameter, your code does not need to do anything different;
// the library will handle the format change.  Examples:
//Adafruit_WS2801 strip = Adafruit_WS2801(25, dataPin, clockPin, WS2801_GRB);
//Adafruit_WS2801 strip = Adafruit_WS2801(25, WS2801_GRB);

#include <MemoryFree.h>

Strip *s = NULL;

double arr[] = {
  // 0.1, 0.2, 0.4, 0.6, 0.8,
  // 1.0, 0.8, 0.6, 0.4, 0.2,
  // 0.1, 0.2, 0.4, 0.6, 0.8,
  // 1.0, 0.8, 0.6, 0.4, 0.2,
  // 0.1, 0.2, 0.4, 0.6, 0.8
  //0, 0, 0, 0, 0,
  1, 0, 0, 0, 0,
  // 1, 1, 1, 1, 1,
  0, 0, 0, 0, 0,
  // 1, 1, 1, 1, 1,
  // 1, 1, 1, 1, 1,
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0,
  // 0, 0, 0, 0, 0,

  // 0, 0, 0, 0, 0,
  // 0, 0, 0, 0, 0,
  // 0, 0, 0, 0, 0,
  // 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0

  // 1, 1, 1, 1, 1,
  // 1, 1, 1, 1, 1,
  // 1, 1, 1, 1, 1,
  // 1, 1, 1, 1, 1,
  // 1, 1, 1, 1, 1
  // 0, 0, 0, 0, 0,
  // 1, 1, 1, 1, 1
};

void printFreeMemory() {
  P("Memory free: ");
  PL(freeMemory());
  NL;
}


uint32_t off = (uint32_t)0;
int onNum = 10;
int offNum = 40;
uint32_t red = C(100,0,0);
uint32_t green = C(0,100,0);
uint32_t blue = C(0,0,100);

ColorArray colorArray(
  6, 
  onNum, red, 
  offNum, off,
  onNum, blue,
  offNum, off,
  onNum, green,
  offNum, off
);

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);

  s = new Strip();

  s->setColor(C(50, 50, 50));
  s->show(true);

}


void loop() {
  // int i, j;
  
  // for (j=0; j < 256 * 5; j++) {     // 5 cycles of all 25 colors in the wheel
  //   for (i=0; i < s->strip->numPixels(); i++) {
  //     // tricky math! we use each pixel as a fraction of the full 96-color wheel
  //     // (thats the i / strip.numPixels() part)
  //     // Then add in j which makes the colors go around per pixel
  //     // the % 96 is to make the wheel cycle around
  //     s->strip->setPixelColor(i, Wheel( ((i * 256 / s->strip->numPixels()) + j) % 256) );
  //   }  
  //   s->strip->show();   // write all the pixels out
  //   delay(50);
  // }

  // s->rotate(1);
  // s->pixels[0] = colors[curColorIdx];
  s->pixels[0] = randomPerturb(s->pixels[0], 2, 100);
  // ++colorArray;
  s->blendRight(1);
  // curColorIdx = (curColorIdx + 1) % numColors;
  s->show();
  delay(10);
}

/* Helper functions */

// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g -b - back to r
uint32_t Wheel(byte WheelPos)
{
  if (WheelPos < 85) {
   return C(WheelPos * 3, 255 - WheelPos * 3, 0);
   } else if (WheelPos < 170) {
     WheelPos -= 85;
     return C(255 - WheelPos * 3, 0, WheelPos * 3);
     } else {
       WheelPos -= 170; 
       return C(0, WheelPos * 3, 255 - WheelPos * 3);
     }
   }
