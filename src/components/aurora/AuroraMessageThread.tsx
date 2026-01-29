import AuroraLayout from './AuroraLayout';

interface AuroraMessageThreadProps {
  conversationId?: string;
}

const AuroraMessageThread = ({ conversationId }: AuroraMessageThreadProps) => {
  // The new layout handles everything including conversation management
  return <AuroraLayout />;
};

export default AuroraMessageThread;
