'use client'

import { useState, useMemo } from 'react'
import {
    Building,
    MapPin,
    Briefcase,
    Wrench,
    Zap,
    Flame,
    Droplets,
    Paintbrush,
    Hammer,
    Home,
    Car,
    Truck,
    Phone,
    Mail,
    Globe,
    Users,
    User,
    Settings,
    Star,
    Heart,
    Tag,
    Folder,
    File,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    Filter,
    Search,
    Plus,
    Edit,
    Trash2,
    Package,
    ShoppingCart,
    CreditCard,
    Banknote,
    Coins,
    Award,
    Target,
    TrendingUp,
    BarChart,
    PieChart,
    Activity,
    Layers,
    Grid,
    List,
    Circle,
    Square,
    Triangle,
    Hexagon,
    Sparkles,
    Sun,
    Moon,
    Cloud,
    Umbrella,
    Wind,
    Thermometer,
    Leaf,
    Trees,
    Mountain,
    type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Icon map for rendering icons from string names
export const iconMap: Record<string, LucideIcon> = {
    building: Building,
    mapPin: MapPin,
    briefcase: Briefcase,
    wrench: Wrench,
    zap: Zap,
    flame: Flame,
    droplets: Droplets,
    paintbrush: Paintbrush,
    hammer: Hammer,
    home: Home,
    car: Car,
    truck: Truck,
    phone: Phone,
    mail: Mail,
    globe: Globe,
    users: Users,
    user: User,
    settings: Settings,
    star: Star,
    heart: Heart,
    tag: Tag,
    folder: Folder,
    file: File,
    clock: Clock,
    calendar: Calendar,
    checkCircle: CheckCircle,
    xCircle: XCircle,
    alertCircle: AlertCircle,
    info: Info,
    filter: Filter,
    search: Search,
    plus: Plus,
    edit: Edit,
    trash2: Trash2,
    package: Package,
    shoppingCart: ShoppingCart,
    creditCard: CreditCard,
    banknote: Banknote,
    coins: Coins,
    award: Award,
    target: Target,
    trendingUp: TrendingUp,
    barChart: BarChart,
    pieChart: PieChart,
    activity: Activity,
    layers: Layers,
    grid: Grid,
    list: List,
    circle: Circle,
    square: Square,
    triangle: Triangle,
    hexagon: Hexagon,
    sparkles: Sparkles,
    sun: Sun,
    moon: Moon,
    cloud: Cloud,
    umbrella: Umbrella,
    wind: Wind,
    thermometer: Thermometer,
    leaf: Leaf,
    trees: Trees,
    mountain: Mountain,
}

// Get icon component from name
export function getIcon(name: string): LucideIcon {
    return iconMap[name] || Circle
}

interface IconPickerProps {
    value: string
    onChange: (icon: string) => void
    trigger?: React.ReactNode
}

export function IconPicker({ value, onChange, trigger }: IconPickerProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredIcons = useMemo(() => {
        const entries = Object.entries(iconMap)
        if (!search) return entries
        return entries.filter(([name]) =>
            name.toLowerCase().includes(search.toLowerCase())
        )
    }, [search])

    const CurrentIcon = getIcon(value)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                    >
                        <CurrentIcon className="h-5 w-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Icon auswählen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Icon suchen..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="grid grid-cols-8 gap-2 max-h-[300px] overflow-y-auto p-1">
                        {filteredIcons.map(([name, Icon]) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    onChange(name)
                                    setOpen(false)
                                    setSearch('')
                                }}
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-muted',
                                    value === name && 'bg-primary text-primary-foreground hover:bg-primary/90'
                                )}
                                title={name}
                            >
                                <Icon className="h-5 w-5" />
                            </button>
                        ))}
                    </div>
                    {filteredIcons.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            Keine Icons gefunden
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
