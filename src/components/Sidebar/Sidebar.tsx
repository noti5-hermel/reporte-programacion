import { SidebarItem } from "./SidebarItem";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 text-gray-800 flex flex-col p-4 border-r">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">Panel</h2>

      <nav className="flex flex-col gap-4">
        <SidebarItem to="/" label="Tabla General" />
        <SidebarItem to="/resumen" label="Tabla Resumida" />
      </nav>
    </aside>
  );
};

export default Sidebar;