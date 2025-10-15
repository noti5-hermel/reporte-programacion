import { SidebarItem } from "./SidebarItem";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6">Panel</h2>

      <nav className="flex flex-col gap-2">
        <SidebarItem to="/" label="Tabla General" />
        <SidebarItem to="/resumen" label="Tabla Resumida" />
      </nav>
    </aside>
  );
};

export default Sidebar;
