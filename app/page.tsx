import Header from '@/components/Header';
import DemoShell from '@/components/DemoShell';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header />
      <DemoShell />
    </div>
  );
}
