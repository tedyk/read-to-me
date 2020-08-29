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
    yield content[i];
  }
}

const speak = (text) => {
  return new Promise((resolve, reject) => {
    if (synth.speaking) {
      reject('speechSynthesis.speaking');
    }
    if (!text || text === '') reject('No text supplied to speak');

    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.onend = () => resolve();
    utterThis.onerror = () => reject();
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
    speak(content.value);
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
});

$( '#play' ).click(() => play() );

$( '#save' ).click(() => {
  localStorage.setItem(KEYS.CONTENT, $('#input').val());
});