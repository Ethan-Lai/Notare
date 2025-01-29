import CreateNote from '../components/CreateNote';
import AskGemini from '../components/AskGemini';

export default function Home() {
  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      <h1>Notes App</h1>
      <div style={{ flex: '1' }}>
        <CreateNote />
      </div>
      <div style={{ flex: '1' }}>
        <h2>Ask Gemini</h2>
        <AskGemini />
      </div>
    </div>
  );
}
