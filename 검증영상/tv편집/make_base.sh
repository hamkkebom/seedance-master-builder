#!/bin/bash
# 노래 광고(콕콕상담·오름)용 바탕 영상·소리 만들기 — 글자는 Remotion에서 얹는다.
# 사용: bash make_base.sh <원본영상> <출력이름> "<팝 효과음 시각(초) 목록>"
# 화면: 한결과 같은 색보정(대비·채도·따뜻하게·비네팅·필름 질감) + 끝에 3초 자연 배경 엔드카드(천천히 줌인).
# 소리: 원본 노래 그대로 + 효과자막 등장 때 팝 소리 + 엔드카드로 넘어갈 때 휙 + 로고 사운드, 유튜브 기준 -14 LUFS.
set -e
SRC="$1"; OUT="$2"; POPS="$3"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")
TOTAL=$(awk "BEGIN{print $DUR+3}")
WH=$(awk "BEGIN{printf \"%d\", ($DUR-0.3)*1000}")
LG=$(awk "BEGIN{printf \"%d\", ($DUR+0.02)*1000}")
VF="[0:v]fps=24,scale=720:1280,eq=contrast=1.06:saturation=1.12,colortemperature=temperature=5900:mix=0.5,vignette=angle=PI/5.5,noise=alls=3:allf=t,setsar=1[m];
[1:v]scale=1440:2560,zoompan=z='1+0.06*on/72':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=72:s=720x1280:fps=24,format=yuv420p,noise=alls=2:allf=t,setsar=1[e];
[m][e]concat=n=2:v=1:a=0,format=yuv420p[v]"
IN=(-i "$SRC" -i endbg/a.png -i sfx/whoosh.mp3 -i sfx/logo.mp3)
AF="[0:a]aresample=48000,apad=whole_dur=$TOTAL[a0];[2:a]volume=0.45,adelay=$WH|$WH[w];[3:a]atrim=0:3.0,afade=t=out:st=2.4:d=0.6,volume=0.7,adelay=$LG|$LG[l]"
MIX="[a0][w][l]"; N=3; i=4
for t in $POPS; do
  ms=$(awk "BEGIN{printf \"%d\", $t*1000}")
  IN+=(-i sfx/pop.mp3); AF="$AF;[$i:a]volume=0.5,adelay=$ms|$ms[p$i]"; MIX="$MIX[p$i]"; N=$((N+1)); i=$((i+1))
done
AF="$AF;${MIX}amix=inputs=$N:normalize=0:duration=first,loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000[a]"
ffmpeg -hide_banner -loglevel error -y "${IN[@]}" -filter_complex "$VF;$AF" -map "[v]" -map "[a]" -t $TOTAL -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "${OUT}_noText.mp4"
ffmpeg -hide_banner -loglevel error -y -i "${OUT}_noText.mp4" -an -c:v copy "${OUT}_video.mp4"
ffmpeg -hide_banner -loglevel error -y -i "${OUT}_noText.mp4" -vn -c:a copy "${OUT}_audio.m4a"
echo "$OUT total=$TOTAL"
