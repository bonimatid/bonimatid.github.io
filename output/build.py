import json, math, re, subprocess, sys
import numpy as np, cv2
V="/root/.claude/uploads/3bc34c1a-1abc-532a-aa72-807f48666f3a/ca3673c2-Rolltake_recording___Nov_9_2026_at_7.39.09_PM-compressed.mov"
OUT=sys.argv[1] if len(sys.argv)>1 else "final.mp4"
LIMIT=float(sys.argv[2]) if len(sys.argv)>2 else None
IW,IH=410,730; OW,OH=1080,1920; FPS=29
FX,FY=190,330   # face anchor in source pixels

# ---------- subtitles ----------
segs=json.load(open("tr.json"))
words=[]
for s in segs:
    for w in s["words"]:
        t=w["w"].strip()
        if t: words.append([t,w["s"],w["e"],s["start"]])
# text fixes
for w in words:
    if w[0]=="אותי,": w[0]="אותי"
def clean(t): return re.sub(r'[.,!?]+$','',t)
chunks=[];cur=[]
for i,w in enumerate(words):
    cur.append(w)
    nxt=words[i+1] if i+1<len(words) else None
    endp=w[0][-1] in ",.?!"
    gap=(nxt[1]-w[2]) if nxt else 9
    if len(cur)>=3 or endp or gap>0.35 or nxt is None or (nxt and nxt[3]!=w[3]) or sum(len(x[0]) for x in cur)>=16:
        chunks.append(cur);cur=[]
def ts(t):
    t=max(0,t);h=int(t//3600);m=int(t%3600//60);s=t%60
    return f"{h}:{m:02d}:{s:05.2f}"
YEL="&H0AD6FF&"; WHT="&HFFFFFF&"
ev=[]
for ci,c in enumerate(chunks):
    cs=c[0][1]; ce=c[-1][2]
    nxt=chunks[ci+1][0][1] if ci+1<len(chunks) else ce+0.6
    ce=min(max(ce+0.15, cs+0.5), nxt)  # hold briefly, never overlap
    for wi,w in enumerate(c):
        ws=cs if wi==0 else w[1]
        we=ce if wi==len(c)-1 else c[wi+1][1]
        if we<=ws: continue
        parts=[]
        for k,x in enumerate(c):
            col=YEL if k==wi else WHT
            parts.append(f"{{\\c{col}}}{clean(x[0])}")
        pop = r"{\fscx82\fscy82\t(0,110,\fscx104\fscy104)\t(110,180,\fscx100\fscy100)\fad(60,0)}" if wi==0 else ""
        ev.append(f"Dialogue: 0,{ts(ws)},{ts(we)},Cap,,0,0,0,,{pop}"+" ".join(reversed(parts)))
ass=f"""[Script Info]
ScriptType: v4.00+
PlayResX: {OW}
PlayResY: {OH}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Heebo,90,&H00FFFFFF,&H00FFFFFF,&H00101010,&H78000000,0,0,0,0,100,100,0,0,1,6,3,2,90,90,560,177

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""+"\n".join(ev)+"\n"
open("subs.ass","w").write(ass)

# ---------- zoom curve ----------
def ease(x): x=min(max(x,0),1); return 0.5-0.5*math.cos(math.pi*x)
# (start, end, from, to) keyframe ramps; between ramps zoom holds
ramps=[(0.3,3.6,1.00,1.17),   # slow push-in on the hook
       (4.6,8.6,1.17,1.00),   # ease back out
       (17.0,22.5,1.00,1.07), # gentle creep on "problems start"
       (22.8,25.5,1.07,1.00),
       (34.5,35.6,1.00,1.10), # "now, don't get me wrong"
       (40.6,44.6,1.10,1.00),
       (45.0,57.2,1.00,1.13)] # slow push through the conclusion
def zoom(t):
    z=1.0
    for a,b,f,to in ramps:
        if t>=b: z=to
        elif t>=a: return f+(to-f)*ease((t-a)/(b-a))
    return z

base=max(OW/IW,OH/IH)
dec=subprocess.Popen(["ffmpeg","-v","error","-i",V,"-f","rawvideo","-pix_fmt","bgr24"]+(["-t",str(LIMIT)] if LIMIT else [])+["-"],stdout=subprocess.PIPE)
enc_cmd=["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","bgr24","-s",f"{OW}x{OH}","-r",str(FPS),"-i","-",
 "-i",V,"-map","0:v","-map","1:a",
 "-vf","ass=subs.ass:fontsdir=fd,format=yuv420p",
 "-af","highpass=f=80,afftdn=nr=14:nf=-38:tn=1,equalizer=f=3000:t=q:w=1.2:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=160:makeup=1.5,loudnorm=I=-14:TP=-1.5:LRA=9",
 "-c:v","libx264","-preset","slow","-crf","17","-profile:v","high","-c:a","aac","-b:a","192k","-ar","48000","-movflags","+faststart","-shortest"]+(["-t",str(LIMIT)] if LIMIT else [])+[OUT]
enc=subprocess.Popen(enc_cmd,stdin=subprocess.PIPE)
n=0;fs=IW*IH*3
while True:
    b=dec.stdout.read(fs)
    if len(b)<fs: break
    img=np.frombuffer(b,np.uint8).reshape(IH,IW,3)
    t=n/FPS; s=base*zoom(t)
    # place face anchor toward its base position, clamp so frame stays covered
    tx=OW/2-(FX*s) + (FX*base-OW/2)  # keep anchor where it sits at base scale
    ty=OH/2-(FY*s) + (FY*base-OH/2)
    tx=min(0,max(OW-IW*s,tx)); ty=min(0,max(OH-IH*s,ty))
    M=np.float32([[s,0,tx],[0,s,ty]])
    out=cv2.warpAffine(img,M,(OW,OH),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT)
    enc.stdin.write(out.tobytes()); n+=1
enc.stdin.close(); enc.wait(); dec.wait()
print("frames",n)
