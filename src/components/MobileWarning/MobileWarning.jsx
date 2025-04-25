import { useEffect, useState } from 'react';

const MobileWarning = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust this threshold as needed
    };

    checkMobile(); // initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center text-center p-4">
      <div>
        <h1 className="text-xl font-bold mb-2">Mobile Not Supported</h1>
        <p>
          It looks like you're viewing this on a mobile device.
          <br />
          Please use a laptop or desktop for the best experience.
        </p>
      </div>
    </div>
  );
};

export default MobileWarning;
