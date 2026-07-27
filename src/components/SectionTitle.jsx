export default function SectionTitle({ eyebrow, title, text, centered = true }) {
  return (
    <div className={`section-title ${centered ? 'text-center mx-auto' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
