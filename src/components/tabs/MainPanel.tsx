import { AppSidebar } from "../app-sidebar";
import { Skeleton } from "../ui/skeleton";

const MainPanel: React.FC = () => {
    return (
        <div className="flex min-w-screen min-h-screen">
            <AppSidebar side="left" variant="sidebar" collapsible="icon" >
            </AppSidebar>
            <Skeleton className="min-w-full min-h-full">

            </Skeleton>
        </div>
    )
}
export default MainPanel;