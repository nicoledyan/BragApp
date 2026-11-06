from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
import argparse
parser=argparse.ArgumentParser(description='Regenerate BRAG printable and fillable PDFs (requires reportlab).')
parser.add_argument('--font-root',type=Path,required=True,help='Directory containing dm-sans and dm-serif-display font packages')
args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1]
R=args.font_root
pdfmetrics.registerFont(TTFont('DMSerif',str(R/'dm-serif-display/400Regular/DMSerifDisplay_400Regular.ttf')))
pdfmetrics.registerFont(TTFont('DMSans',str(R/'dm-sans/400Regular/DMSans_400Regular.ttf')))
pdfmetrics.registerFont(TTFont('DMSansBold',str(R/'dm-sans/600SemiBold/DMSans_600SemiBold.ttf')))
OUT=ROOT/'downloads'
OUT.mkdir(exist_ok=True)
forest=HexColor('#1E301E');sage=HexColor('#557855');muted=HexColor('#486848');border=HexColor('#D9E4D3');paper=HexColor('#FAFCF8');tint=HexColor('#F1F7EE');gold=HexColor('#C8A050')

def text(c,x,y,s,size=10,font='DMSans',color=forest):
 c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,s)
def field(c,name,x,y,w,h,multi=False):
 c.acroForm.textfield(name=name,tooltip=name.replace('_',' ').capitalize(),x=x,y=y,width=w,height=h,fontName='Helvetica',fontSize=11,textColor=forest,borderWidth=0,fillColor=white,forceBorder=False,fieldFlags='multiline' if multi else '',maxlen=2500 if multi else 200)
def base(filename,title,subtitle,kicker):
 c=canvas.Canvas(str(OUT/filename),pagesize=(612,792));c.setTitle(title.replace('\n',' '));c.setAuthor('BRAG');c.setSubject('A free, printable and fillable worksheet from bragbag.app')
 c.setFillColor(paper);c.rect(0,0,612,792,fill=1,stroke=0)
 logo=ImageReader(str(ROOT/'images/logo.png'));w,h=logo.getSize();c.drawImage(logo,48,735,width=26*w/h,height=26,mask='auto')
 text(c,365,742,kicker,8,'DMSansBold',muted)
 c.setStrokeColor(border);c.line(48,721,564,721)
 for i,line in enumerate(title.split('\n')):text(c,48,677-i*43,line,39,'DMSerif')
 text(c,49,608,subtitle,10.5,color=muted)
 c.setStrokeColor(border);c.line(48,43,564,43)
 text(c,48,26,'BRAG  /  Your wins deserve to be remembered.',8,color=muted)
 text(c,482,26,'bragbag.app',8,'DMSansBold',sage)
 c.linkURL('https://bragbag.app/',(480,20,565,38),relative=0)
 return c

def box(c,num,title,prompt,name,y,h):
 c.setFillColor(white);c.setStrokeColor(border);c.setLineWidth(.7);c.roundRect(48,y,516,h,12,fill=1,stroke=1)
 c.setFillColor(tint);c.circle(69,y+h-22,10,fill=1,stroke=0);text(c,66,y+h-25,num,8,'DMSansBold',sage)
 text(c,86,y+h-26,title,12,'DMSansBold')
 text(c,65,y+h-44,prompt,9,color=muted)
 field(c,name,64,y+10,484,h-59,True)

def meta(c,label,name,x,y,w):
 text(c,x,y+24,label,8,'DMSansBold',muted)
 field(c,name,x,y,w,19)
 c.setStrokeColor(border);c.line(x,y-2,x+w,y-2)

c=base('brag-book-template.pdf','Small wins.\nWorth keeping.','A moment you might forget. A record you get to keep.','THE BRAG BOOK  /  01')
meta(c,'DATE','date',48,563,180);meta(c,'TAGS / PART OF LIFE','tags',256,563,308)
box(c,'1','What happened?','Big milestone or ordinary moment. Both count.','what_happened',443,99)
box(c,'2','What did you do?','Keep the part that was yours.','what_i_did',328,99)
box(c,'3','Why did it matter?','What changed, felt easier, or made you proud?','why_it_mattered',213,99)
box(c,'+','A little proof, if you have it','A kind word, a result, or a detail your future self will want.','evidence_or_feedback',98,99)
text(c,49,65,'One sentence is enough. Fill this in on screen or print it and make it yours.',9,color=muted)
c.showPage();c.save()

c=base('performance-review-worksheet.pdf','Your work,\nwell remembered.','Turn one real contribution into an accomplishment you can explain.','THE REVIEW WORKSHEET  /  02')
meta(c,'DATE / PERIOD','date_or_period',48,563,160);meta(c,'PROJECT / RESPONSIBILITY','project',236,563,328)
box(c,'1','Set the scene','What needed attention?','the_situation',451,90)
box(c,'2','Name your contribution','What did you personally do?','my_contribution',347,90)
box(c,'3','Show what changed','Use a supported outcome. Add a metric only if you have one.','verified_outcome',243,90)
meta(c,'EVIDENCE TO REFERENCE','evidence',48,201,244);meta(c,'SKILL / ROLE EXPECTATION','skill_or_expectation',320,201,244)
box(c,'4','Put it into words','I [contributed] so that [verified outcome].','review_ready_sentence',82,99)
text(c,49,58,'Keep confidential evidence in your employer\'s approved systems.',8.5,color=muted)
c.showPage();c.save()
print('Created two one-page, fillable BRAG PDFs.')
