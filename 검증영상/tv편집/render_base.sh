#!/bin/bash
# 한결 v2 유튜브 광고 편집본 렌더링.
# 소리: 원본 영상 소리에서 대사만 분리(stems/vocals.mp3)해서 쓰고, 원래 섞여 있던 음악·알림음·탁자 소리는 버린다.
# 배경음악: 0~3초 오케스트라 긴장 / 3~10초 거의 무음(전화벨만) + 반전 직전 현악 상승 / 10.4초 반전부터 코믹 펑크 음악 → 결혼식에서 조금 키움 → 엔드카드 로고 사운드로 마무리.
# 음악은 대사가 나올 때 자동으로 줄어든다(사이드체인 더킹).
set -e
T='in/24'
Z="if(between($T,0,0.4),1.10-0.10*($T)/0.4,if(between($T,1.12,1.55),1.06,if(between($T,10.42,10.9),1.14-0.14*($T-10.42)/0.48,if(between($T,13.63,14.1),1.10-0.10*($T-13.63)/0.47,if(between($T,18.08,18.5),1.08-0.08*($T-18.08)/0.42,1)))))"
X="iw/2-(iw/zoom/2)+if(between($T,1.12,1.55),12*sin(in*2.7),0)"
Y="ih/2-(ih/zoom/2)+if(between($T,1.12,1.55),9*cos(in*3.1),0)"
FL=""
FL=",eq=brightness=0.22:enable='between(t,18.08,18.13)',eq=brightness=0.11:enable='between(t,18.13,18.19)'"
for c in 3.46 7.25 13.63; do e=$(awk "BEGIN{print $c+0.05}"); FL="$FL,eq=brightness=0.10:enable='between(t,$c,$e)'"; done
LOGO_IN=""; LOGO_F=""
VF="[0:v]zoompan=z='$Z':x='$X':y='$Y':d=1:s=720x1280:fps=24,eq=contrast=1.07:saturation=1.16,colortemperature=temperature=5800:mix=0.6,vignette=angle=PI/5.5,noise=alls=3:allf=t,eq=brightness=0.16:enable='between(t,10.42,10.47)',eq=brightness=0.08:enable='between(t,10.47,10.53)',eq=brightness=0.08:saturation=1.3:enable='between(t,1.15,1.25)'$FL,setsar=1[m];
[20:v]scale=1440:2560,zoompan=z='1+0.06*on/72':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=72:s=720x1280:fps=24,format=yuv420p,noise=alls=2:allf=t,setsar=1[e];
[m][e]concat=n=2:v=1:a=0,format=yuv420p[v]"
D(){ echo "adelay=$1|$1"; }
AF="[1:a]aresample=48000,volume='if(between(t,3.3,7.9),0,1)':eval=frame,equalizer=f=3000:t=q:w=1:g=3,equalizer=f=180:t=q:w=1:g=-3,acompressor=threshold=0.1:ratio=3:attack=5:release=80:makeup=2,apad=whole_dur=26.04,asplit=2[vo][key];
[2:a]aresample=48000,atrim=0:3.6,afade=t=out:st=2.8:d=0.8,volume=0.75[m1];
[3:a]aresample=48000,atrim=0:4.32,volume=0.32,$(D 6100)[m2];
[4:a]aresample=48000,volume='if(gte(t,7.66),0.62,0.48)':eval=frame,atrim=0:15.62,afade=t=out:st=15.0:d=0.62,$(D 10420)[m3];
[15:a]aresample=48000,atrim=0:5,afade=t=in:d=0.3,afade=t=out:st=4.2:d=0.8,volume=0.32,$(D 18100)[m4];
[m1][m2][m3][m4]amix=inputs=4:normalize=0,apad=whole_dur=26.04[mus];
[mus][key]sidechaincompress=threshold=0.035:ratio=8:attack=15:release=350:makeup=1[musd];
[5:a]volume=0.55,$(D 1150)[s1];
[6:a]volume=0.6,$(D 10380)[s2];
[7:a]volume=0.3,$(D 3150)[w1];
[8:a]volume=0.3,$(D 6950)[w2];
[9:a]volume=0.3,$(D 13330)[w3];
[10:a]volume=0.65,$(D 17780)[w4];
[11:a]volume=0.4,$(D 22750)[w5];
[12:a]atrim=0:3.3,afade=t=out:st=2.9:d=0.4,volume=0.42,$(D 3700)[r1];
[13:a]volume=0.45,$(D 9250)[h1];
[14:a]volume=0.85,$(D 11950)[p1];
[16:a]atrim=0:3.0,afade=t=out:st=2.4:d=0.6,volume=0.7,$(D 23050)[l1];
[17:a]volume=0.3,$(D 20400)[h2];
[s1][s2][w1][w2][w3][w4][w5][r1][h1][p1][l1][h2]amix=inputs=12:normalize=0,apad=whole_dur=26.04[fx];
[vo][musd][fx]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000[a]"
S=sfx
ffmpeg -hide_banner -loglevel error -y -i src.mp4 -i stems/vocals.mp3 \
 -i $S/orch_hit.mp3 -i $S/riser.mp3 -i bgm/comedy16.mp3 \
 -i $S/boom.mp3 -i $S/boom.mp3 \
 -i $S/whoosh.mp3 -i $S/whoosh.mp3 -i $S/whoosh.mp3 -i $S/whoosh.mp3 -i $S/whoosh.mp3 \
 -i $S/ring.mp3 -i $S/shing.mp3 -i $S/pop.mp3 -i $S/applause.mp3 -i $S/logo.mp3 -i $S/shing.mp3 \
 -loop 1 -framerate 24 -t 26.04 -i logo/logo_black.png -loop 1 -framerate 24 -t 26.04 -i logo/logo_black_glow.png \
 -i endbg/a.png \
 -filter_complex "$VF;$AF" -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t 26.04 base_noText.mp4
