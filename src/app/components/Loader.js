"use client";
export default function Loader() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <img
        src="/assets/images/logo/Logo 7.png"
        alt="Loading..."
        className="pulse"
        style={{
          width: "80px",
          height: "80px",
        }}
      />

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .pulse {
          animation: pulse 1.0s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
