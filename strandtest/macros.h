
#ifndef __MACROS_H__
#define __MACROS_H__

#define DEBUG 1

#if DEBUG

#define P(x) Serial.print(x);
#define PL(x) Serial.println(x);
#define NL Serial.println("");
#define PP(x) P((long unsigned int)x);
#define PPL(x) PL((long unsigned int)x);
#define PT(a,b,c) P("(")P(a)P(",")P(b)P(",")P(c)P(")")
#define PC(c) PT(R(c),G(c),B(c))

#else

#define P(x) 0;
#define PL(x) 0;
#define NL 0;
#define PP(x) 0;
#define PPL(x) 0;
#define PT(a,b,c) 0;
#define PC(c) 0;

#endif

#endif