import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class VoiceService {
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<MediaStream> {
    this.audioContext = new AudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1
      } 
    });

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm'
    });

    this.audioChunks = [];
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    return this.stream;
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        throw new Error('No active recording');
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'hu'
    });

    return response.text;
  }

  async getChatResponse(message: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Te KITT vagy, a Knight Industries Two Thousand mesterséges intelligencia. Válaszolj röviden, magabiztosan, és KITT stílusában. Beszélj első személyben és használj technikai kifejezéseket.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'Sajnálom, nem értettem a kérést.';
  }

  async textToSpeech(text: string): Promise<ArrayBuffer> {
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'onyx',
      input: text,
      speed: 1.25
    });

    return await response.arrayBuffer();
  }

  async playAudio(audioData: ArrayBuffer, onAudioLevel?: (level: number) => void): Promise<void> {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    const source = audioContext.createBufferSource();
    
    source.playbackRate.setValueAtTime(0.85, audioContext.currentTime);
    
    source.buffer = audioBuffer;
    
    if (onAudioLevel) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        onAudioLevel(average / 255);
        
        if (!source.buffer || audioContext.state === 'closed') return;
        requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } else {
      source.connect(audioContext.destination);
    }
    
    return new Promise((resolve) => {
      source.onended = () => resolve();
      source.start();
    });
  }

  getAudioLevel(stream: MediaStream): Promise<number> {
    return new Promise((resolve) => {
      if (!this.audioContext) {
        resolve(0);
        return;
      }

      const analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const getLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        resolve(average / 255);
      };

      requestAnimationFrame(getLevel);
    });
  }
}

export const voiceService = new VoiceService();