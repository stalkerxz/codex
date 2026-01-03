type PlaceholderImageProps = {
  label: string;
};

const PlaceholderImage = ({ label }: PlaceholderImageProps) => {
  return (
    <div className="placeholder-image">
      <span>{label}</span>
    </div>
  );
};

export default PlaceholderImage;
