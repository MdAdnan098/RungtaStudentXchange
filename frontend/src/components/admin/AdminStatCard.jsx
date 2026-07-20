const AdminStatCard = ({ icon: Icon, label, value }) => (
  <div className="card-padded flex items-center gap-3">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary-subtle-text">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <div>
      <p className="font-display text-h3 text-text">{value}</p>
      <p className="text-caption text-text-muted">{label}</p>
    </div>
  </div>
);

export default AdminStatCard;
