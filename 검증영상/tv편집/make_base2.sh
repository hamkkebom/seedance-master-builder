#!/bin/bash
# 노래 광고 바탕 영상·소리 2차 — 배경음악(반주)까지 다시 섞는다.
# 사용: bash make_base2.sh <원본영상> <이름(kok|orum)> <반주 키움 dB> "<팝 효과음 시각 목록>"
# 소리 설계:
#  · 원본 노래를 목소리(stems/<이름>_vocals.mp3)와 반주(stems/<이름>_inst.mp3)로 나눠서 따로 다듬는다.
#    분석 결과 반주가 목소리보다 11~16 LU 작아 배경음악이 거의 안 들렸다 → 반주를 키워 목소리와 4~6 LU 차이로 맞춘다.
#  · 목소리: 저음 정리 + 3kHz 또렷하게 + 가벼운 압축.  반주: 초저역 정리, 목소리가 나올 때만 살짝(약 3dB) 비켜 주는 사이드체인.
#  · 노래가 끝나면 엔드카드 3초 동안 같은 분위기의 마무리 음악(bgm/<이름>_outro.mp3 끝 3.3초)이 이어지고 마지막 한 방으로 끝난다 + 로고 사운드.
#  · 효과자막 팝 소리, 엔드카드로 넘어가는 휙 소리, 최종 -14 LUFS.
set -e
# CLICK_END=초: 0초~그 시점까지 딸깍거리는 효과음(예: 콕콕상담 첫 장면 계산기 소리)을 걸러낸다. 없으면 0.
CE="${CLICK_END:-0}"
SRC="$1"; OUT="$2"; GAIN="$3"; POPS="$4"
# CUT=초: 원본을 이 시점에서 잘라 바로 엔드카드로 넘긴다(끝에 멈칫하는 정지 구간 제거). OUTRO_AT=초: 마무리 음악 시작 시점(반주가 먼저 끝나는 경우 앞당김).
DUR=${CUT:-$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")}
TOTAL=$(awk "BEGIN{print $DUR+3}")
WH=$(awk "BEGIN{printf \"%d\", ($DUR-0.3)*1000}")
LG=$(awk "BEGIN{printf \"%d\", ($DUR+0.02)*1000}")
OD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 bgm/${OUT}_outro.mp3)
OA=${OUTRO_AT:-$(awk "BEGIN{print $DUR-0.3}")}
OST=$(awk "BEGIN{s=$OD-($TOTAL-$OA); if(s<0)s=0; print s}")
OT=$(awk "BEGIN{printf \"%d\", $OA*1000}")
FADE=$(awk "BEGIN{print $DUR-0.35}")
VF="[0:v]trim=0:$DUR,setpts=PTS-STARTPTS,fps=24,scale=720:1280,eq=contrast=1.06:saturation=1.12,colortemperature=temperature=5900:mix=0.5,vignette=angle=PI/5.5,noise=alls=3:allf=t,setsar=1[m];
[1:v]scale=1440:2560,zoompan=z='1+0.06*on/72':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=72:s=720x1280:fps=24,format=yuv420p,noise=alls=2:allf=t,setsar=1[e];
[m][e]concat=n=2:v=1:a=0,format=yuv420p[v]"
IN=(-i "$SRC" -i endbg/a.png -i stems/${OUT}_vocals.mp3 -i stems/${OUT}_inst.mp3 -i bgm/${OUT}_outro.mp3 -i sfx/whoosh.mp3 -i sfx/logo.mp3)
AF="[2:a]atrim=0:$DUR,aresample=48000,adeclick=w=20:o=75:t=2:enable='lt(t,$CE)',highpass=f=90,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.15:ratio=2.5:attack=8:release=120:makeup=1,asplit=2[vo][key];
[3:a]atrim=0:$DUR,aresample=48000,adeclick=w=20:o=75:t=2:enable='lt(t,$CE)',highshelf=f=1500:g=-24:enable='lt(t,$CE)',highpass=f=35,equalizer=f=300:t=q:w=1.2:g=-2,equalizer=f=2500:t=q:w=1:g=-1.5,volume=${GAIN}dB,afade=t=out:st=$FADE:d=0.35[ins];
[ins][key]sidechaincompress=threshold=0.05:ratio=3:attack=20:release=300[insd];
[4:a]aresample=48000,atrim=start=$OST,asetpts=PTS-STARTPTS,afade=t=in:d=0.15,volume=0.9,adelay=$OT|$OT[out];
[5:a]volume=0.45,adelay=$WH|$WH[w];[6:a]atrim=0:3.0,afade=t=out:st=2.4:d=0.6,volume=0.8,adelay=$LG|$LG[l]"
MIX="[vo][insd][out][w][l]"; N=5; i=7
for t in $POPS; do
  ms=$(awk "BEGIN{printf \"%d\", $t*1000}")
  IN+=(-i sfx/pop.mp3); AF="$AF;[$i:a]volume=0.5,adelay=$ms|$ms[p$i]"; MIX="$MIX[p$i]"; N=$((N+1)); i=$((i+1))
done
AF="$AF;${MIX}amix=inputs=$N:normalize=0,apad=whole_dur=$TOTAL,atrim=0:$TOTAL,loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000[a]"
ffmpeg -hide_banner -loglevel error -y "${IN[@]}" -filter_complex "$VF;$AF" -map "[v]" -map "[a]" -t $TOTAL -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "${OUT}_noText.mp4"
ffmpeg -hide_banner -loglevel error -y -i "${OUT}_noText.mp4" -vn -c:a copy "${OUT}_audio.m4a"
ffmpeg -hide_banner -loglevel error -y -i "${OUT}_noText.mp4" -an -c:v copy "${OUT}_video.mp4"
echo "$OUT total=$TOTAL $(ffmpeg -hide_banner -i ${OUT}_audio.m4a -af ebur128=framelog=quiet -f null - 2>&1 | grep ' I:' | tail -1)"
