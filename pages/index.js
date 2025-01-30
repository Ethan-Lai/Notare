import CreateNote from '../components/CreateNote';
import UploadNote from '../components/UploadNote';

export default function Home() {
  return (
    <div>
      <h1>Notes App</h1>
      <CreateNote />
      <UploadNote />
    </div>
  );
}

