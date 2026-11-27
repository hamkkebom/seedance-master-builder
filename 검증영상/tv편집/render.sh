#!/bin/bash
set -e
T='in/24'
Z="if(between($T,0,0.4),1.10-0.10*($T)/0.4,if(between($T,1.12,1.55),1.06,if(between($T,10.42,10.9),1.14-0.14*($T-10.42)/0.48,if(between($T,13.63,14.1),1.10-0.10*($T-13.63)/0.47,if(between($T,18.08,18.5),1.08-0.08*($T-18.08)/0.42,1)))))"
X="iw/2-(iw/zoom/2)+if(between($T,1.12,1.55),12*sin(in*2.7),0)"
Y="ih/2-(ih/zoom/2)+if(between($T,1.12,1.55),9*cos(in*3.1),0)"
FL=""
for c in 3.46 7.25 13.63 18.08; do e=$(awk "BEGIN{print $c+0.05}"); FL="$FL,eq=brightness=0.10:enable='between(t,$c,$e)'"; done
VF="[0:v]zoompan=z='$Z':x='$X':y='$Y':d=1:s=720x1280:fps=24,eq=contrast=1.07:saturation=1.16,colortemperature=temperature=5800:mix=0.6,vignette=angle=PI/5.5,noise=alls=3:allf=t,eq=brightness=0.16:enable='between(t,10.42,10.47)',eq=brightness=0.08:enable='between(t,10.47,10.53)',eq=brightness=0.08:saturation=1.3:enable='between(t,1.15,1.25)'$FL,setsar=1[m];
gradients=s=720x1280:c0=0x4a1470:c1=0x0c0620:x0=360:y0=560:x1=360:y1=1400:type=radial:speed=0.02:d=3:r=24,vignette=angle=PI/4,noise=alls=2:allf=t,setsar=1[e];
[m][e]concat=n=2:v=1:a=0,ass=tv.ass:fontsdir=fonts,format=yuv420p[v]"
D(){ echo "adelay=$1|$1"; }
AF="[0:a]aresample=48000,equalizer=f=3000:t=q:w=1:g=3,equalizer=f=200:t=q:w=1:g=-2,apad=whole_dur=26.04[a0];
[1:a]volume=0.35,$(D 0)[s1];
[2:a]volume=0.6,$(D 1150)[s2];
[3:a]volume=0.6,$(D 10380)[s3];
[4:a]volume=0.35,$(D 3150)[w1];
[5:a]volume=0.35,$(D 6950)[w2];
[6:a]volume=0.35,$(D 13330)[w3];
[7:a]volume=0.35,$(D 17780)[w4];
[8:a]volume=0.4,$(D 22750)[w5];
[9:a]atrim=0:3.3,afade=t=out:st=2.9:d=0.4,volume=0.32,$(D 3700)[r1];
[10:a]volume=0.45,$(D 9250)[h1];
[11:a]volume=0.3,$(D 20400)[h2];
[12:a]volume=0.45,$(D 11950)[p1];
[13:a]volume=0,$(D 14700)[p2];
[14:a]volume=0,$(D 4300)[p3];
[15:a]atrim=0:3.2,afade=t=out:st=2.6:d=0.6,volume=0.8,$(D 23050)[l1];
[a0][s1][s2][s3][w1][w2][w3][w4][w5][r1][h1][h2][p1][p2][p3][l1]amix=inputs=16:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]"
S=sfx
ffmpeg -hide_banner -loglevel error -y -i src.mp4 \
 -i $S/boom.mp3 -i $S/boom.mp3 -i $S/boom.mp3 \
 -i $S/whoosh.mp3 -i $S/whoosh.mp3 -i $S/whoosh.mp3 -i $S/whoosh.mp3 -i $S/whoosh.mp3 \
 -i $S/ring.mp3 -i $S/shing.mp3 -i $S/shing.mp3 -i $S/pop.mp3 -i $S/pop.mp3 -i $S/pop.mp3 -i $S/logo.mp3 \
 -filter_complex "$VF;$AF" -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t 26.04 ../한결_v2_TV편집본.mp4
