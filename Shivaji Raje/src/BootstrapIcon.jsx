export default function BootstrapIcon({name, className = ''}) {
  return <svg className={`bi-icon ${className}`.trim()} aria-hidden="true" focusable="false">
    <use href={`icons/bootstrap.svg#${name}`}/>
  </svg>;
}
