import React from 'react';

export const FadeIn = ({ children, delay = 0, duration = 0.3 }) => (
  <div 
    className="fade-in"
    style={{
      animation: `fadeIn ${duration}s ease-out ${delay}s both`
    }}
  >
    {children}
  </div>
);

export const SlideIn = ({ children, direction = 'left', delay = 0, duration = 0.4 }) => (
  <div 
    className={`slide-in slide-in-${direction}`}
    style={{
      animation: `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} ${duration}s ease-out ${delay}s both`
    }}
  >
    {children}
  </div>
);

export const ScaleIn = ({ children, delay = 0, duration = 0.3 }) => (
  <div 
    className="scale-in"
    style={{
      animation: `scaleIn ${duration}s ease-out ${delay}s both`
    }}
  >
    {children}
  </div>
);

export const Ripple = ({ children, onClick }) => {
  const handleClick = (e) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-effect');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    if (onClick) onClick(e);
  };

  return (
    <div className="ripple-container" onClick={handleClick}>
      {children}
    </div>
  );
};

export const TypeWriter = ({ text, speed = 50, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span className="typewriter">{displayText}</span>;
};

export const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${10 + Math.random() * 20}s`
      }}
    />
  ));

  return <div className="floating-particles">{particles}</div>;
};
