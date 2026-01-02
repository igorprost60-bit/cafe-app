import banner from '../assets/banner.jpg';

export function Banner() {
  return (
    <div className="mb-8 rounded-2xl overflow-hidden bg-white">
      <img
        src={banner}
        alt="Banner"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
