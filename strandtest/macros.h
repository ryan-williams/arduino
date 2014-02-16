
#ifndef __MACROS_H__
#define __MACROS_H__

#define DEBUG 0

#if DEBUG

#define P(x) Serial.print(x);
#define PL(x) Serial.println(x);
#define NL Serial.println("");
#define PP(x) P((long unsigned int)x);
#define PPL(x) PL((long unsigned int)x);

#else

#define P(x) 0;
#define PL(x) 0;
#define NL 0;
#define PP(x) 0;
#define PPL(x) 0;

#endif

#endif