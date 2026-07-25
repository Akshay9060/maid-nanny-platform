const Footer = () => (
  <footer className="border-t border-clay bg-sand py-8 mt-16">
    <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink/60">
      <p>&copy; {new Date().getFullYear()} Ghar Sahay. Verified help, on your terms.</p>
      <p>Built for households and helpers alike.</p>
    </div>
  </footer>
);

export default Footer;
