

"""
additional notes: 

This is the code used for the EEG sesssion in:
Jabar, S. B., Filipowicz, A. and Anderson, B. (2017). Tuned by Experience: How Orientation Probability Modulates Early Perceptual Processing. Vision Research,138, 86-96. 
https://doi.org/10.1016/j.visres.2017.07.008


"""

#Setup
from psychopy import *
import random, cPickle, time, numpy, types, string
from pyglet.window import key
import psychopy.info
from psychopy import monitors
from psychopy import sound
from psychopy.tools.monitorunittools import deg2pix

# switches
lab = 1
debug = 0
block_counter = 0 # display a counter to show block number. for testing purposes only.
pulse_frame = 1 # activate the relevant pins for how many frames
expclock = core.Clock()
expt_start_time = expclock.getTime()

if lab == 1:
    from psychopy import parallel
    parallel.setPortAddress(address='/dev/parport0')
    genpath = '/usr/local/lab/protocol/ProbEEG/'

    def printPins():
        print '' 
        for i in range(2,10):
            print 'pin', str(i),'=',str(parallel.readPin(i))
        print ''

    def setPins(x): 
        parallel.setData( int(x,2) )

    import pylink as pl
    core.wait(0.5)

    def eyeTrkInit (sp):
         	el = pl.EyeLink("100.1.1.1")
         	el.sendCommand("screen_pixel_coords = 0 0 %d %d" %sp)
         	el.sendMessage("DISPLAY_COORDS  0 0 %d %d" %sp)
         	el.sendCommand("select_parser_configuration 0")
         	el.sendCommand("scene_camera_gazemap = NO")
         	el.sendCommand("pupil_size_diameter = %s"%("YES"))
         	return(el)

    #Calibrate Eyetracker - el is eytracker object, sp is screen position, cd screen luminance (?)
    def eyeTrkCalib (el,sp,cd):
         pl.openGraphics(sp,cd)
         pl.setCalibrationColors((255,255,255),(120,120,120)) # (target),(background)
         pl.setTargetSize(int(sp[0]/70), int(sp[1]/300)) # int(sp[0]/70), int(sp[1]/300)
         pl.setCalibrationSounds("","","")
         pl.setDriftCorrectSounds("","off","off")
         el.doTrackerSetup() #Launches the 'Camera Setup' in Eyelink - from there do the calibration on the eyelink computer
         pl.closeGraphics()

    # Opens edf data file - make sure a datafile name does not exceed 6 characters (or else you get bad value error)
    def eyeTrkOpenEDF (dfn,el):
         el.openDataFile(dfn + '.EDF')

    def eyeQuit(edf_fn,el):
        el.stopRecording()
        core.wait(0.5)
        el.setOfflineMode()
        core.wait(0.5)
        el.closeDataFile()
        #el.receiveDataFile(edf_fn+".EDF", datafilename+".edf")
        el.close()
        pl.closeGraphics()

		
else:
    #genpath = '/home/s2jabar/Dropbox/Waterloo/BrittLab/ProbEEG/'
    #genpath = 'C:/Users/Syaheed/Dropbox/Waterloo/BrittLab/ProbEEG/'
    genpath = '/usr/local/lab/protocol/ProbEEG/'
	
errorTone = sound.Sound(value=genpath + "code/error.wav") #200, secs=0.3)
errorTone.setVolume(0.45)
rewardTone = sound.Sound(value=genpath + "code/reward.wav")

# ########################## Parallel Port Testing ########################################

#Pin codes (ground = uninsulated cables)
#FixPins      = '00000001' # black wire with white stripe (works)
#HighProbPins = '00000010' # medium brown
#LowProbPins  = '00000100' # white brown
#PracProbPins = '00001000' # red (works)
#OddballPins  = '00010000' # red white
#RespPins     = '00100000' # orange (works)
#ConPins      = '01000000' # white orange (works)
#FeedPins     = '10000000' # yellow (works)
#ResetPins    = '00000000' # no pins active

# ########################## Events ########################################

ResetPins         = '00000000' # Event 0
FixPins           = '00000001' # Event 1
Calib             = '01000111' # Event 71
Drift             = '01001000' # Event 72

# Gabors
GaborPrac           = '00001010' # Event 10
GaborTopRightHigh   = '00001011' # Event 11
GaborBotRightHigh   = '00001100' # Event 12
GaborBotLeftHigh    = '00001101' # Event 13
GaborTopLeftHigh    = '00001110' # Event 14
GaborTopRightLow    = '00001111' # Event 15
GaborBotRightLow    = '00010000' # Event 16
GaborBotLeftLow     = '00010001' # Event 17
GaborTopLeftLow     = '00010010' # Event 18

# Initiation (clockwise)
InitCPrac           = '00010100' # Event 20
InitCTopRightHigh   = '00010101' # Event 21
InitCBotRightHigh   = '00010110' # Event 22
InitCBotLeftHigh    = '00010111' # Event 23
InitCTopLeftHigh    = '00011000' # Event 24
InitCTopRightLow    = '00011001' # Event 25
InitCBotRightLow    = '00011010' # Event 26
InitCBotLeftLow     = '00011011' # Event 27
InitCTopLeftLow     = '00011100' # Event 28

# Initiation (anticlockwise)
InitAPrac           = '00011110' # Event 30
InitATopRightHigh   = '00011111' # Event 31
InitABotRightHigh   = '00100000' # Event 32
InitABotLeftHigh    = '00100001' # Event 33
InitATopLeftHigh    = '00100010' # Event 34
InitATopRightLow    = '00100011' # Event 35
InitABotRightLow    = '00100100' # Event 36
InitABotLeftLow     = '00100101' # Event 37
InitATopLeftLow     = '00100110' # Event 38

# Confirmation
ConPrac           = '00101000' # Event 40
ConTopRightHigh   = '00101001' # Event 41
ConBotRightHigh   = '00101010' # Event 42
ConBotLeftHigh    = '00101011' # Event 43
ConTopLeftHigh    = '00101100' # Event 44
ConTopRightLow    = '00101101' # Event 45
ConBotRightLow    = '00101110' # Event 46
ConBotLeftLow     = '00101111' # Event 47
ConTopLeftLow     = '00110000' # Event 48


# Feedback ("ding" / correct)
FCPrac           = '00110010' # Event 50
FCTopRightHigh   = '00110011' # Event 51
FCBotRightHigh   = '00110100' # Event 52
FCBotLeftHigh    = '00110101' # Event 53
FCTopLeftHigh    = '00110110' # Event 54
FCTopRightLow    = '00110111' # Event 55
FCBotRightLow    = '00111000' # Event 56
FCBotLeftLow     = '00111001' # Event 57
FCTopLeftLow     = '00111010' # Event 58

# Feedback ("dong" / wrong)
FWPrac           = '00111100' # Event 60
FWTopRightHigh   = '00111101' # Event 61
FWBotRightHigh   = '00111110' # Event 62
FWBotLeftHigh    = '00111111' # Event 63
FWTopLeftHigh    = '01000000' # Event 64
FWTopRightLow    = '01000001' # Event 65
FWBotRightLow    = '01000010' # Event 66
FWBotLeftLow     = '01000011' # Event 67
FWTopLeftLow     = '01000100' # Event 68

###################################################################

if debug == 0:
    myDlg = gui.Dlg(title='User Info')
    myDlg.addField('ID:')
    myDlg.addField('Version:')
    myDlg.addField('Gender (m/f):')
    myDlg.addField('Age:')
    myDlg.addField('Hand (r/l):')
    myDlg.addField('Eye Dominance (R/L):')
    myDlg.show()  # show dialog and wait for OK or Cancel

    userid =  myDlg.data[0]
    versionid =  myDlg.data[1]
    gender =  myDlg.data[2]
    age =  myDlg.data[3]
    hand = myDlg.data[4]
    eyeDom = myDlg.data[5]
    
else:
    userid = 'Debug'
    versionid = 'A'
    gender = 'male'
    age = '99'
    hand = 'left'
    eyeDom = 'R'

if versionid == 'a':
    versionid = 'A'
elif versionid == '1':
    versionid = 'A'
elif versionid == 'A':
    versionid = 'A'
elif versionid == 'b':
    versionid = 'B'
elif versionid == 'B':
    versionid = 'B'
elif versionid == '2':
    versionid = 'B'
else:
    versionid = 'A'

if eyeDom == 'r':
    eyeDom = 'R'
elif eyeDom == 'l':
    eyeDom = 'L'
else:
    eyeDom = 'R'

monitorName = 'ExpMonitor'
fullScreen = True
expMonitor = monitors.Monitor(monitorName)
Resolution = expMonitor.getSizePix()

expWin = visual.Window(Resolution,allowGUI=True,winType='pyglet',monitor=expMonitor,units='deg',screen=0,fullscr=fullScreen, color = [0,0,0], waitBlanking = False)
scrX = Resolution[0]
scrY = Resolution[1]
expWin.setMouseVisible(False)
keyState=key.KeyStateHandler()
expWin.winHandle.push_handlers(keyState)
expWin.winHandle.activate()
protocol = 'ProbEGGB_eeg'

# Testing and Setup
curtime = time.localtime()
datafilename = genpath + 'data/' + protocol + '_' + versionid + '_' + userid + '_' + time.strftime("%Y%m%d_%H%M", curtime)
datafile = open(datafilename + '.csv', 'w')
infofile = open(datafilename + '.info', 'w')
curInfo = psychopy.info.RunTimeInfo(win = expWin)
infofile.write(str(curInfo))
infofile.close()
avgFrame = curInfo['windowRefreshTimeAvg_ms'] / 1000.0 #in terms of seconds
sdFrame = curInfo['windowRefreshTimeSD_ms'] / 1000.0 #in terms of seconds
resolution = str(scrX) + ',' + str(scrY)
dp_conv = deg2pix(1.0,expMonitor)


if lab == 1:
    setPins('11111111')     ### Start EEG recording ###
    core.wait(0.020)
    setPins('00000000')

#Params
stimsize = 4.0
stimdist = 4.0
centerPos = [0.0,0.0]

toprightPos = [3.625,1.690]
botrightPos = [2.828,-2.828]
botleftPos  = [-2.828,-2.828]
topleftPos  = [-3.625,1.690]

#toprightPos = [ stimdist, stimdist]
#botrightPos = [ stimdist,-stimdist]
#botleftPos  = [-stimdist,-stimdist]
#topleftPos  = [-stimdist, stimdist]

errorThreshold = 12
fix_thresh = 50
default_ori = 90
textSize = 0.75
charsize = 1
fixspotsize = 1.2
stimtexRes = 256
stim_sf = 4
stim_contrast = 0.8
eye_timeout = 3.0
orispread = 89
color = 'black'
pos1 = 'toprightPos'
pos2 = 'botrightPos'
pos3 = 'botleftPos'
pos4 = 'topleftPos'

num_local = 20
num_prac = 3
sets_local = 240 + num_prac #sets of local (add num_prac for the practice) # 240 + num_prac

prac_list = [1]*num_local*num_prac
prac_list.extend([0]*num_local*(sets_local-num_prac))

task_list = [0] * num_local
task_list[-1] = 1

eyelink_starttime = 0
search_time = 0


drift_blocks = list(numpy.multiply(range(0,41),10) + num_prac)
drift_blocks.remove(63)
drift_blocks.remove(123)
drift_blocks.remove(183)

if sets_local in drift_blocks:
    drift_blocks.remove(sets_local)

if versionid == 'A':
	mu1 = 135
	mu2 = 45
elif versionid == 'B':
	mu1 = 45
	mu2 = 135
	
if debug == 0:
    frespdelay = round(0.50/avgFrame) # delay in frames bet stim offset and resp (0.35)
    fITI = round(0.5/avgFrame) #inter-trial frames (blank)
    ffix = round(0.5/avgFrame) #fixation frames, adjusted randomly in trial loop
    fstim = round(0.05/avgFrame) #stim frames
    ffeed = round(0.35/avgFrame) # feedback frames prac only)
    ftimeout = round(7/avgFrame) #frames response will be available to make
elif debug == 1:
    frespdelay = 1 # delay in frames bet stim offset and resp
    fITI = 1 #inter-trial frames (blank)
    ffix = 1 #fixation frames
    fstim = 1 #stim frames
    ffeed = 1 # feedback frames prac only)
    ftimeout = 1 #frames response will be available to make
    
## List Manufacture
stimOri_list_final = []
fixcolor_list_final = []
stimpos_list_final = []
prob_list_final = []
tilt_list_final = []
cond_list_final = []
trial_list_final = []
block_list_final = []
trial_in_block_list_final = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] * sets_local
task_list_final = []

# for local
for set in range(sets_local):

    #initialise
    stimOri_list = []
    fixcolor_list = []
    stimpos_list = []
    prob_list = []
    tilt_list = []
    cond_list = []
	
    stimOri_list_shuff = []
    fixcolor_list_shuff = []
    stimpos_list_shuff = []
    prob_list_shuff = []
    tilt_list_shuff = []
    cond_list_shuff = []

    for i in range(num_local):

        if (i >= 0) & (i < 4):
            stimOri_list.append(round(mu1 + orispread*(random.random() - 0.5)))
            fixcolor_list.append('black')
            stimpos_list.append(pos1)
            tilt_list.append(1)
            prob_list.append('0.8')
            cond_list.append(fixcolor_list[i] + '_' + stimpos_list[i] + '_'  + prob_list[i] + '_' + str(mu1))

        elif (i >= 4) & (i < 8):
            stimOri_list.append(round(mu2 + orispread*(random.random() - 0.5)))
            fixcolor_list.append('black')
            stimpos_list.append(pos3)
            tilt_list.append(2)
            prob_list.append('0.8')
            cond_list.append(fixcolor_list[i] + '_' + stimpos_list[i] + '_'  + prob_list[i] + '_' + str(mu2))

        elif (i >= 8) & (i < 12):
            stimOri_list.append(round(mu1 + orispread*(random.random() - 0.5)))
            fixcolor_list.append('black')
            stimpos_list.append(pos2)
            tilt_list.append(1)
            prob_list.append('0.8')
            cond_list.append(fixcolor_list[i] + '_' + stimpos_list[i] + '_'  + prob_list[i] + '_' + str(mu1))

        elif (i >= 12) & (i < 16):
            stimOri_list.append(round(mu2 + orispread*(random.random() - 0.5)))
            fixcolor_list.append('black')
            stimpos_list.append(pos4)
            tilt_list.append(2)
            prob_list.append('0.8')
            cond_list.append(fixcolor_list[i] + '_' + stimpos_list[i] + '_'  + prob_list[i] + '_' + str(mu2))
        
        elif (i == 16) :
            stimOri_list.append(round(mu2 + orispread*(random.random() - 0.5)))
            fixcolor_list.append('black')
            stimpos_list.append(pos1)
            tilt_list.append(2)
            prob_list.append('0.2')
            cond_list.append(fixcolor_list[i] + '_' + stimpos_list[i] + '_'  + prob_list[i] + '_' + str(mu2))

        elif (i == 17) :
            stimOri_list.append(round(mu1 + orispread*(random.random() - 0.5)))
            fixcolor_list.append('black')
            stimpos_list.append(pos3)
            tilt_list.append(1)
            prob_list.append('0.2')
            cond_list.append(fixcolor_list[i] + '_' + stimpos_list[i] + '_'  + prob_list[i] + '_' + str(mu1))

        elif (i == 18) :
            stimOri_list.append(round(mu2 + orispread*(random.random() - 0.5)))
            fixcolor_list.append('black')
            stimpos_list.append(pos2)
            tilt_list.append(2)
            prob_list.append('0.2')
            cond_list.append(fixcolor_list[i] + '_' + stimpos_list[i] + '_'  + prob_list[i] + '_' + str(mu2))

        elif (i == 19) :
            stimOri_list.append(round(mu1 + orispread*(random.random() - 0.5)))
            fixcolor_list.append('black')
            stimpos_list.append(pos4)
            tilt_list.append(1)
            prob_list.append('0.2')
            cond_list.append(fixcolor_list[i] + '_' + stimpos_list[i] + '_'  + prob_list[i] + '_' + str(mu1))        


    shuffle_list = random.sample(range(num_local),num_local)
    block_list_final.extend([set+1]*(num_local))

    for i in range(num_local):
        temp = shuffle_list[i]
        stimOri_list_shuff.append(stimOri_list[temp-1])
        fixcolor_list_shuff.append(fixcolor_list[temp-1])
        stimpos_list_shuff.append(stimpos_list[temp-1])
        prob_list_shuff.append(prob_list[temp-1])
        cond_list_shuff.append(cond_list[temp-1])
        tilt_list_shuff.append(tilt_list[temp-1])

    stimOri_list_final.extend(stimOri_list_shuff)
    fixcolor_list_final.extend(fixcolor_list_shuff)
    stimpos_list_final.extend(stimpos_list_shuff)
    prob_list_final.extend(prob_list_shuff)
    cond_list_final.extend(cond_list_shuff)
    tilt_list_final.extend(tilt_list_shuff)

    if set == num_prac-1:
        task_list_final.extend(task_list)
    elif set == sets_local-1:
        task_list_final.extend(task_list)
    else:
        task_list_final.extend(random.sample(task_list, num_local))	
		
trial_list_final.extend(range(1,(num_local+1)*sets_local+1))

ntrials = len(stimOri_list_final)
datafile.write("Subject,Gender,Age,Handedness,Experiment,Version,Trial,Block,TrialBlock,Task,Condition,Prob,FixColor,ExptStart,StimPos,FixOnset,FixDur_pre,StimOnset,StimOffset,StimDur,RespLineOnset,MovementMade,ResponseMade,ResponseInitial,ResponseFinal,FeedOnset,FeedOffSet,RT,IT,MT,ACC,StimOri,RepOri,angDiff,abs_angDiff,errorThreshold,initialMovement,clockwiseAmount,counterclockwiseAmount,vacillations,scrX,scrY,avgFrame,sdFrame,stimsize,stimdist,default_ori,fixspotsize,frespdelay,fITI,ffix,fstim,ffeed,ftimeout,num_prac,stimtexRes,stim_sf,stim_contrast,eyelink_start,eye_stim_time,eye_search_time,eye_timeout,recal,planned_soa,actual_soa,fix_thresh,sets_local,task,deg2pix,isPrac,ExptType,EyeDom\n")

# create stims
fix = visual.TextStim(expWin, units = 'deg', height = fixspotsize, text = '+',color='black', pos = [0.0,0.1])
stim = visual.PatchStim(expWin, tex="sin", mask = "gauss", texRes = 256, size= [stimsize,stimsize], sf = [4,0],ori = 180, pos = topleftPos, contrast = stim_contrast)
repline = visual.ShapeStim(expWin,vertices = numpy.array([ (0,-stimsize/4.0),(0,stimsize/4.0)]),lineWidth = 3.0, lineColor = 'black', fillColor = (0.0,0.0,0.0),closeShape = False,ori = default_ori, units = 'deg', pos = [0.0,0.0])
feedline = visual.ShapeStim(expWin,vertices = numpy.array([ (0,-stimsize/4.0),(0,stimsize/4.0)]),lineWidth = 2.0, lineColor = 'white', fillColor = (0.0,0.0,0.0),closeShape = False,ori = default_ori, units = 'deg', pos =  [0.0,0.0])
blockText = visual.TextStim(expWin, units = 'deg', height = fixspotsize/2, text = 'xxx',color='white', pos = [0.0,0.0])

######################################
if lab == 1 :
    scrx = int(Resolution[0])
    scry = int(Resolution[1])
    eyelink = eyeTrkInit((scrx,scry))
    edf_fn = "E" + str(userid) 
    core.wait(0.5)
    eyeTrkOpenEDF(edf_fn,eyelink)
    eyeTrkCalib(eyelink,(scrx,scry),32)
    errorTone = sound.Sound(value=genpath + "code/error.wav") #200, secs=0.3)
    errorTone.setVolume(0.45)
    rewardTone = sound.Sound(value=genpath + "code/reward.wav")

    # To sync Eyetracker, Psychopy and EEG times:
    expt_start_time = expclock.getTime() # overwrite to sync with EEGtime
    message = "User " + str(userid) + " " + "Version " + str(versionid) + "" + "Sync EEG Pulse 99 at Psychopy Time " + str(expt_start_time) + " Deg2Pix " + str(dp_conv) + " Resolution " + str(scrx) + " "  + str(scry)

    setPins('01100011') ## Pulse 99
    core.wait(0.020)
    setPins('00000000')

    eyelink.sendMessage(message)
    eyelink.startRecording(1,1,1,1)
    eyelink_starttime = pl.currentTime()

if debug == 0:
    #Start instructions
    expWin.winHandle.activate()
    text = visual.TextStim(expWin, units = 'deg', height = textSize, text = 'In this experiment, you will see brief spatial patterns, and are required to try to match the pattern using a rotatable line as accurately as you can.\n\nPress "Z" and "C" to rotate the line, and press "X" to confirm your judgement.\n\nPlease keep your eyes on the centre of the screen (at the "+" sign) at all times.\n\nYou will first be given some practice.\nIf you see a white dot in the middle of the screen, look at it and press "SPACE". \n\n\nPress "X" to start the practice trials.',color='black', pos =  [0.0,0.0])
    alert = visual.TextStim(expWin, units = 'deg', height = textSize, text = 'Please alert the experimenter to recalibrate the eyetracker',color='black', pos = centerPos)			    

    nframe = 0
    wait_stop = 1
    while nframe < 10000000:
        text.draw()
        expWin.flip()
        nframe = nframe + 1
        
        while wait_stop == 1 : # to prevent accidental clicking
            core.wait(1)
            wait_stop = 0
                
        if keyState[key.X] == True:
            break
        elif keyState[key.ESCAPE] == True:
            core.quit()

#Blank
expWin.flip() # blank screen
core.wait(1)
expWin.flip() # blank screen

#Begin loop
for i in range(ntrials):
	if lab == 1:
		eyelink.sendCommand("record_status_message 'Trial %d, Block %d'"%((i+1), block_list_final[i]))
	#Get trial params
	fixcolor = fixcolor_list_final[i]
	if prac_list[i] == 1:
		stimOri_list_final[i] = int(((random.random()-0.5)*2*89)+90)
		prob_list_final[i] = '0.5'
	stimOri = stimOri_list_final[i]
	if block_counter == 1:
		blockText.setText(str(block_list_final[i]))
	if stimpos_list_final[i] == 'topleftPos': 
		stimpos = topleftPos
	elif stimpos_list_final[i] == 'toprightPos':
		stimpos = toprightPos
	elif stimpos_list_final[i] == 'botleftPos':
		stimpos = botleftPos
	elif stimpos_list_final[i] == 'botrightPos':
		stimpos = botrightPos
	
	#Fix
	nframe = 0
	fix_time = expclock.getTime()
	if debug == 0:
		fix_dur = random.uniform(0.250, 0.500)
		ffix = round(fix_dur/avgFrame) #fixation frames
	else:
		fix_dur = avgFrame
		ffix = 1
	while nframe < ffix:
		fix.setColor(fixcolor) # change to decided fixcolor
		fix.draw()
		if block_counter == 1:
			blockText.draw()
		if (nframe == 0) & (lab ==1):
			setPins(FixPins)
		elif (nframe == pulse_frame) & (lab ==1):
			setPins(ResetPins)
		expWin.flip()
		nframe = nframe + 1
		
		if keyState[key.ESCAPE] == True:
			if lab == 1:
				eyelink.sendMessage("Interrupted")
				eyeQuit(edf_fn,eyelink)
			core.quit()

	#Gabor
	search_time = expclock.getTime()
	stim.setPos(stimpos) # change to decided stimpos
	stim.setOri(stimOri) # change to decided stim ori
	nframe = 0
	eye_avail = 0
	recal = 0
	eye_start_time = 0

	while (eye_avail == 0) & (lab==1):
		sample = eyelink.getNewestSample()
		if sample != None:
			sample_time = expclock.getTime()
			eye = None
			if eyeDom == 'R':
				eye = sample.getRightEye().getGaze()
			elif eyeDom == 'L':
				eye = sample.getLeftEye().getGaze()
			eyeT = [(eye[0]-(scrx/2)),-(eye[1]-(scry/2))]	
			if (abs(eyeT[0])< fix_thresh) & (abs(eyeT[1])< fix_thresh):
				eye_avail = 1
			elif (sample_time - search_time) > eye_timeout:				
				eye_avail = 1
				recal = 1		
				alert.draw()
				expWin.flip()
				core.wait(2.0)
				setPins(Calib)
				core.wait(0.020)
				setPins(ResetPins)					
				pl.openGraphics((scrx,scry),32)
				eyelink.doTrackerSetup()
				pl.closeGraphics()
				eyelink.startRecording(1,1,1,1)
				errorTone = sound.Sound(value=genpath + "code/error.wav") #200, secs=0.3)
				errorTone.setVolume(0.45)
				rewardTone = sound.Sound(value=genpath + "code/reward.wav")
				expWin.winHandle.activate()
				keyState[key.X] = False
				keyState[key.Z] = False
				keyState[key.C] = False
				event.clearEvents()
				fix.draw() # repeat same fixation on next flip	
				expWin.flip() # fix only
				fix.draw() # repeat same fixation on next flip	
				expWin.flip() # fix only

	fix.draw() # repeat same fixation on next flip	
	expWin.flip() # fix only
	stim_start_time = expclock.getTime()
	if lab == 1:
		eye_start_time = pl.currentTime()
	planned_soa = round(fix_dur*1000)
	actual_soa = (stim_start_time - fix_time)*1000
	
	if lab == 1:
		message_text1 = "StimOnset " + str(stim_start_time) + " Trial " + str(i+1) + " PosX(deg) " + str(round(stimpos[0],1)) + " PosY(deg) " + str(round(stimpos[1],1)) + " PosX(pix) " + str(round(deg2pix(stimpos[0],expMonitor),1)) + " PosY(pix) " + str(round(deg2pix(stimpos[1],expMonitor),1)) + " Ori " + str(stimOri)  + " Prob " + str(prob_list_final[i]) 
		message_text2 = "Recalib " + str(recal) + " SOAp " + str(round(planned_soa)) + " SOAa " + str(round(actual_soa)) + " Task " + str(task_list_final[i])
		eyelink.sendMessage(message_text1)
		eyelink.sendMessage(message_text2)
	
	while nframe < fstim:
		fix.draw() # repeat same fixation on next flip
		stim.draw()
		if block_counter == 1:
			blockText.draw()
		if (nframe == 0) & (lab ==1):

# ####### Gabor Pins ###############
 			if (stimpos == topleftPos) & (prob_list_final[i] == '0.2'):
				setPins(GaborTopLeftLow)
 			elif (stimpos == toprightPos) & (prob_list_final[i] == '0.2'):
				setPins(GaborTopRightLow)
 			elif (stimpos == botrightPos) & (prob_list_final[i] == '0.2'):
				setPins(GaborBotRightLow)
 			elif (stimpos == botleftPos) & (prob_list_final[i] == '0.2'):
				setPins(GaborBotLeftLow)
 			elif (stimpos == topleftPos) & (prob_list_final[i] == '0.8'):
				setPins(GaborTopLeftHigh)
 			elif (stimpos == toprightPos) & (prob_list_final[i] == '0.8'):
				setPins(GaborTopRightHigh)
 			elif (stimpos == botrightPos) & (prob_list_final[i] == '0.8'):
				setPins(GaborBotRightHigh)
 			elif (stimpos == botleftPos) & (prob_list_final[i] == '0.8'):
				setPins(GaborBotLeftHigh)
 			elif (prob_list_final[i] == '0.5'):
				setPins(GaborPrac)
# ############################

		elif (nframe == pulse_frame) & (lab ==1):
			setPins(ResetPins)
            
		expWin.flip() # fixation + stim
		nframe = nframe + 1
	stim_end_time = expclock.getTime()
	stimUptime = (round((stim_end_time-stim_start_time)*1000,2))
	fixprestim = (round((stim_start_time-fix_time)*1000,2))
	
	#Delay
	nframe = 0
	resp = 0
	ACC = 0
	angDiff = 0
	movement = 0
	resp_start_time = 0
	resp_end_time = 0
	line_start_time = 0
	feed_start_time = 0
	clockwise_counter = 0
	counter_clockwise_counter = 0
	initial_movement = 'None'
	old_dir = 'None'
	vacillations = 0
	resOri = default_ori
	repline.setOri(default_ori)
	repline.setPos(stimpos) # change to decided stimpos    
    
	while (task_list_final[i] == 1) & (nframe < (frespdelay+ftimeout)):
		if nframe > frespdelay:
			fix.draw()
			repline.draw()
			if block_counter == 1:
				blockText.draw()
		elif nframe == frespdelay:
			fix.draw()
			repline.draw()
			line_start_time = expclock.getTime()
		else:
			fix.draw()

		if keyState[key.X] == True:
			resp = 1
			resp_end_time = expclock.getTime()
			break

		elif keyState[key.Z] == True:
			repline.setOri(resOri-1)
			resOri = resOri -1
			counter_clockwise_counter = counter_clockwise_counter + 1
			if movement == 0:
				resp_start_time = expclock.getTime()
				initial_movement = 'counter'
				resp_frame = nframe
				if (nframe == resp_frame) & (lab ==1):
# ####### InitAnti Pins ###############
		 			if (stimpos == topleftPos) & (prob_list_final[i] == '0.2'):
						setPins(InitATopLeftLow)
		 			elif (stimpos == toprightPos) & (prob_list_final[i] == '0.2'):
						setPins(InitATopRightLow)
		 			elif (stimpos == botrightPos) & (prob_list_final[i] == '0.2'):
						setPins(InitABotRightLow)
		 			elif (stimpos == botleftPos) & (prob_list_final[i] == '0.2'):
						setPins(InitABotLeftLow)
		 			elif (stimpos == topleftPos) & (prob_list_final[i] == '0.8'):
						setPins(InitATopLeftHigh)
		 			elif (stimpos == toprightPos) & (prob_list_final[i] == '0.8'):
						setPins(InitATopRightHigh)
		 			elif (stimpos == botrightPos) & (prob_list_final[i] == '0.8'):
						setPins(InitABotRightHigh)
		 			elif (stimpos == botleftPos) & (prob_list_final[i] == '0.8'):
						setPins(InitABotLeftHigh)
		 			elif (prob_list_final[i] == '0.5'):
						setPins(InitAPrac)
# ############################
				movement = 1
			elif (movement == 1) & (nframe == resp_frame + pulse_frame) & (lab ==1):
				setPins(ResetPins)
			elif old_dir == 'clockwise':
				vacillations = vacillations + 1
			old_dir = 'counter'
				
		elif keyState[key.C] == True:
			repline.setOri(resOri+1)
			resOri = resOri +1
			clockwise_counter = clockwise_counter + 1
			if movement == 0:
				resp_start_time = expclock.getTime()
				initial_movement = 'clockwise'
				resp_frame = nframe
				if (nframe==resp_frame) & (lab ==1):
# ####### InitClock Pins ###############
		 			if (stimpos == topleftPos) & (prob_list_final[i] == '0.2'):
						setPins(InitCTopLeftLow)
		 			elif (stimpos == toprightPos) & (prob_list_final[i] == '0.2'):
						setPins(InitCTopRightLow)
		 			elif (stimpos == botrightPos) & (prob_list_final[i] == '0.2'):
						setPins(InitCBotRightLow)
		 			elif (stimpos == botleftPos) & (prob_list_final[i] == '0.2'):
						setPins(InitCBotLeftLow)
		 			elif (stimpos == topleftPos) & (prob_list_final[i] == '0.8'):
						setPins(InitCTopLeftHigh)
		 			elif (stimpos == toprightPos) & (prob_list_final[i] == '0.8'):
						setPins(InitCTopRightHigh)
		 			elif (stimpos == botrightPos) & (prob_list_final[i] == '0.8'):
						setPins(InitCBotRightHigh)
		 			elif (stimpos == botleftPos) & (prob_list_final[i] == '0.8'):
						setPins(InitCBotLeftHigh)
		 			elif (prob_list_final[i] == '0.5'):
						setPins(InitCPrac)
# ############################
				movement = 1
			elif (movement == 1) & (nframe == resp_frame + pulse_frame) & (lab ==1):
				setPins(ResetPins)
			elif old_dir == 'counter':
				vacillations = vacillations + 1
			old_dir = 'clockwise'
		
		elif keyState[key.ESCAPE] == True:
			core.quit()
		
		expWin.flip()
		nframe = nframe + 1
	
	if (resp == 1) & (task_list_final[i] == 1):
		if resp_start_time == 0:
			resp_start_time = resp_end_time
		angDiff = (resOri - stimOri + 90)%180 - 90
		if abs(angDiff) > errorThreshold:
			errorTone.play()
		else:
			rewardTone.play()
			ACC = 1
	else:
		if (task_list_final[i] == 1):
			errorTone.play()
			resp_end_time = expclock.getTime()
	
	if resp == 1:
		RT = round((resp_end_time-stim_start_time)*1000,2)
		MT = round((resp_end_time-resp_start_time)*1000,2)
		IT = RT-MT
	else:
		RT = 0
		MT = 0
 		IT = 0
	
	#feedback line
	core.wait(0.040)
	if task_list_final[i] == 1:
		nframe = 0
		feedline.setOri(stimOri)
		feedline.setPos(stimpos) # change to decided stimpos

		while nframe < ffeed:
			fix.draw() # repeat same fixation on next flip
			repline.draw()
			feedline.draw()
			if (nframe == 0) & (lab ==1) & (ACC == 1):
# ####### Feed (ding) Pins ###############
		 		if (stimpos == topleftPos) & (prob_list_final[i] == '0.2'):
					setPins(FCTopLeftLow)
		 		elif (stimpos == toprightPos) & (prob_list_final[i] == '0.2'):
					setPins(FCTopRightLow)
	 			elif (stimpos == botrightPos) & (prob_list_final[i] == '0.2'):
					setPins(FCBotRightLow)
		 		elif (stimpos == botleftPos) & (prob_list_final[i] == '0.2'):
					setPins(FCBotLeftLow)
		 		elif (stimpos == topleftPos) & (prob_list_final[i] == '0.8'):
					setPins(FCTopLeftHigh)
		 		elif (stimpos == toprightPos) & (prob_list_final[i] == '0.8'):
					setPins(FCTopRightHigh)
		 		elif (stimpos == botrightPos) & (prob_list_final[i] == '0.8'):
					setPins(FCBotRightHigh)
		 		elif (stimpos == botleftPos) & (prob_list_final[i] == '0.8'):
					setPins(FCBotLeftHigh)
		 		elif (prob_list_final[i] == '0.5'):
					setPins(FCPrac)
# ######################
			elif (nframe == 0) & (lab ==1) & (ACC == 0):
# ####### Feed (dong) Pins ###############
 		 		if (stimpos == topleftPos) & (prob_list_final[i] == '0.2'):
					setPins(FWTopLeftLow)
		 		elif (stimpos == toprightPos) & (prob_list_final[i] == '0.2'):
					setPins(FWTopRightLow)
	 			elif (stimpos == botrightPos) & (prob_list_final[i] == '0.2'):
					setPins(FWBotRightLow)
		 		elif (stimpos == botleftPos) & (prob_list_final[i] == '0.2'):
					setPins(FWBotLeftLow)
		 		elif (stimpos == topleftPos) & (prob_list_final[i] == '0.8'):
					setPins(FWTopLeftHigh)
		 		elif (stimpos == toprightPos) & (prob_list_final[i] == '0.8'):
					setPins(FWTopRightHigh)
		 		elif (stimpos == botrightPos) & (prob_list_final[i] == '0.8'):
					setPins(FWBotRightHigh)
		 		elif (stimpos == botleftPos) & (prob_list_final[i] == '0.8'):
					setPins(FWBotLeftHigh)
		 		elif (prob_list_final[i] == '0.5'):
					setPins(FWPrac)
# ######################
			elif (nframe == pulse_frame) & (lab ==1):
				setPins(ResetPins)
			expWin.flip() # fixation + resp + feedback
			feed_start_time = expclock.getTime()
			nframe = nframe + 1
	
	feed_end_time = expclock.getTime()	

	#Do drift correction after a response
	if (task_list_final[i] == 1) & (block_list_final[i] in drift_blocks) & (block_list_final[i] < drift_blocks) & (lab == 1):
		setPins(Drift)
		core.wait(0.020)
		setPins(ResetPins)
		pl.openGraphics((scrx,scry),32)
		eyelink.doDriftCorrect(scrx/2,scry/2,1,1)
		eyelink.applyDriftCorrect()
		eyelink.startRecording(1,1,1,1)
		pl.closeGraphics()
		errorTone = sound.Sound(value=genpath + "code/error.wav") #200, secs=0.3)
		errorTone.setVolume(0.45)
		rewardTone = sound.Sound(value=genpath + "code/reward.wav")
		expWin.winHandle.activate()
		keyState[key.X] = False
		keyState[key.Z] = False
		keyState[key.C] = False
		event.clearEvents()
	
	#Blank
	nframe = 0
	while (task_list_final[i] == 1)  & (nframe < fITI):
		expWin.flip() # revert to blank screen
		nframe = nframe + 1
	
	dataRow = userid +  "," + gender +  "," + age +  "," + hand + "," + protocol + "," + versionid + "," + str(trial_list_final[i]) + "," + str(block_list_final[i]) + "," + str(trial_in_block_list_final[i])  + "," + str(task_list_final[i]) + "," + cond_list_final[i] + "," + prob_list_final[i] + "," + fixcolor + "," + str(expt_start_time) + "," + stimpos_list_final[i] + "," + str(fix_time) + "," + str(fixprestim) + "," + str(stim_start_time) + "," + str(stim_end_time) + "," + str(stimUptime) + "," + str(line_start_time) + "," + str(movement) + "," + str(resp) + "," + str(resp_start_time) + "," + str(resp_end_time) + "," + str(feed_start_time) + "," + str(feed_end_time) + "," + str(RT) + "," + str(IT) + "," + str(MT) + "," + str(ACC) + "," + str(stimOri) + "," + str(resOri)  + "," + str(angDiff) + "," + str(abs(angDiff)) + "," + str(errorThreshold) + "," + initial_movement + "," + str(clockwise_counter) + "," + str(counter_clockwise_counter) + "," + str(vacillations) + "," + resolution + "," + str(avgFrame*1000) + "," + str(sdFrame*1000) + "," + str(stimsize) + "," + str(stimdist) + "," + str(default_ori) + "," + str(fixspotsize) + "," + str(frespdelay) + "," + str(fITI) + "," + str(ffix) + "," + str(fstim) + "," + str(ffeed) + "," + str(ftimeout) + "," + str(num_prac) +  "," + str(stimtexRes) + "," + str(stim_sf) + "," + str(stim_contrast) + "," + str(eyelink_starttime) + "," + str(eye_start_time) + "," + str(search_time) + "," + str(eye_timeout) + "," + str(recal) + "," + str(planned_soa) + "," + str(actual_soa) + "," + str(fix_thresh) + "," + str(sets_local) + "," + str(task_list_final[i]) + "," + str(dp_conv) + "," + str(prac_list[i])+ "," + "bev" + "," + str(eyeDom)              
	datafile.write(dataRow + "\n")
	event.clearEvents()
	
	core.wait(0.020)	
 
	#End Prac instructions
	if (task_list_final[i] == 1)  &  (block_list_final[i] == num_prac)  :
		text = visual.TextStim(expWin, units = 'deg', height = textSize, text = 'You have completed the practice trials.\n\nIf you have any queries, please alert the experimenter.\n\nOtherwise, you may press "X" to continue to the main experiment.',color='black', pos = centerPos)
		nframe = 0
		wait_stop = 1
		while nframe < 10000000:
			text.draw()
			expWin.flip()
			nframe = nframe + 1
			if wait_stop == 1 : # to prevent accidental clicking
				core.wait(3)
				wait_stop = 0
			if keyState[key.X] == True:
				break
		pl.openGraphics((scrx,scry),32)
		eyelink.doDriftCorrect(scrx/2,scry/2,1,1)
		eyelink.applyDriftCorrect()
		eyelink.startRecording(1,1,1,1)
		expWin.flip()
		pl.closeGraphics()
		errorTone = sound.Sound(value=genpath + "code/error.wav") #200, secs=0.3)
		errorTone.setVolume(0.45)
		rewardTone = sound.Sound(value=genpath + "code/reward.wav")
		expWin.winHandle.activate()
		keyState[key.X] = False
		keyState[key.Z] = False
		keyState[key.C] = False
		event.clearEvents()
	
	#Break instructions
	if (task_list_final[i] == 1):
 		if (block_list_final[i] == 60+num_prac) | (block_list_final[i] == 120+num_prac) | (block_list_final[i] == 180+num_prac) :
			text = visual.TextStim(expWin, units = 'deg', height = textSize, text = 'You may take a short break.\n\nPress "X" to continue with the experiment.',color='black', pos = centerPos)
			wait_stop = 1
			nframe = 0
			while nframe < 10000000:
				text.draw()
				expWin.flip()
				nframe = nframe + 1
				if wait_stop == 1 : # to prevent accidental clicking
					core.wait(3)
					wait_stop = 0
				if keyState[key.X] == True:
					break
			alert.draw()
			expWin.flip()
			core.wait(2.0)
			setPins(Calib)
			core.wait(0.020)
			setPins(ResetPins)						
			pl.openGraphics((scrx,scry),32)
			eyelink.doTrackerSetup()
			expWin.flip()			
			pl.closeGraphics()
			eyelink.startRecording(1,1,1,1)
			errorTone = sound.Sound(value=genpath + "code/error.wav") #200, secs=0.3)
			errorTone.setVolume(0.45)
			rewardTone = sound.Sound(value=genpath + "code/reward.wav")
			expWin.winHandle.activate()
			keyState[key.X] = False
			keyState[key.Z] = False
			keyState[key.C] = False
			event.clearEvents()
			fix.draw() # repeat same fixation on next flip	
			expWin.flip() # fix only
			fix.draw() # repeat same fixation on next flip	
			expWin.flip() # fix only
		
		
#End instructions
print "All trials ran!"

if (lab ==1):
    expt_end_time = expclock.getTime()
    core.wait(0.500)
    setPins('11111110') # End pulse (254)
    core.wait(0.020)
    setPins(ResetPins)

if debug == 0:
    text = visual.TextStim(expWin, units = 'deg', height = textSize, text = 'You have completed this portion of the experiment.\n\nThank you!',color='black', pos = centerPos)
    expWin.flip()
    if lab == 1:
        eyelink.sendMessage("DONE")
        eyeQuit(edf_fn,eyelink)
    while nframe < 100:
        text.draw()
        expWin.flip()
        nframe = nframe + 1
        
core.quit()