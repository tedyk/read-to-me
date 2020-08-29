const KEYS = {
  CONTENT: 'key-content',
  VOICE: 'key-voice',
}

const synth = window.speechSynthesis;
let availableVoices;

let speechContent;
let activeVoice;

function* getSpeechContent () {
  const content  = $('#input').val().trim().split('\n');
  for (let i = 0; i < content.length; i++) {
    yield {
      text: content[i],
      hasNext: i < content.length - 1
    }
  }
}


const disablePlay = () => {
  $( '#play' ).hide();
  $( '#spin' ).show();
}

const enablePlay = () => {
  $( '#play' ).show();
  $( '#spin' ).hide();
}

const initButtons = () => {
  $( '#play' ).show();
  $( '#spin' ).hide();
  $( '#reset' ).hide();
}

const speak = (text) => {
  return new Promise((resolve, reject) => {
    if (synth.speaking) {
      reject('speechSynthesis.speaking');
    }
    if (!text || text === '') reject('No text supplied to speak');

    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.onstart = () => {
      disablePlay();
    };
    utterThis.onend = () => {
      enablePlay();
      resolve();
    };
    utterThis.onerror = () => {
      enablePlay();
      reject();
    };
    utterThis.voice = activeVoice;
    utterThis.pitch = 1;
    utterThis.rate = 1;
    synth.speak(utterThis);  
  });
}

const play = () => {
  if(!speechContent) {
    speechContent = getSpeechContent();
  }
  const content = speechContent.next();
  if(!content.done) {
    speak(content.value.text).then(() => {
      if(!content.value.hasNext) {
        $( '#reset' ).show();
        $( '#play' ).hide();
        $( '#spin' ).hide();
      }  
    });
  }
}

$( document ).ready(function() {
  // Load previously saved input content
  $('#input').val(localStorage.getItem(KEYS.CONTENT) || '');
  availableVoices = synth.getVoices();

  // Populate available voices for display
  for (let i=0; i<availableVoices.length; i++){
    $( '<option/>' ).val(i).html(`${availableVoices[i].name} (${availableVoices[i].lang})`).appendTo( '#voices' );
  }
  const savedVoiceIndex = Number(localStorage.getItem(KEYS.VOICE) || 0);
  activeVoice = availableVoices[savedVoiceIndex];
  $( '#voices' ).val(savedVoiceIndex).change();

  // Handle the selection of a different voice
  $( '#voices' ).on('change', () => {
    const voiceIndex = $( '#voices' ).val();
    activeVoice = availableVoices[voiceIndex];
    localStorage.setItem(KEYS.VOICE, voiceIndex);
  });

  initButtons();
});

// Handler for the "Play" button
$( '#play' ).click(() => play() );

// Handler for the "Reset" button
$( '#reset' ).click(() => {
  speechContent = getSpeechContent();
  initButtons();
 });

 // Handler for the "Save" button
$( '#save' ).click(() => {
  localStorage.setItem(KEYS.CONTENT, $('#input').val());
});