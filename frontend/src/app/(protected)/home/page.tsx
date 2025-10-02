import DashboardClient from "@/components/dashboard/dashboard";
import { GetGames } from "../lib/dashboard";
import { game } from "@/constants/dashboard";


export default async function Dashboard() {
    const initialGames: game[] = await GetGames()
    return (
        <DashboardClient initialGames={initialGames}/>
    )
}