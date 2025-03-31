import React from "react";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { ModeToggle } from "./mode-toggle";
import { Plus, Search, Bell, BookCopy, LayoutTemplate } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function NavBar() {
    return (
        <div>
            {/* Top Menu - Visible only on lg and above */}
            <Menubar className="hidden lg:flex flex-row justify-between items-center w-full py-6 border-b border-t-0 border-x-0 rounded-none">
                <div className="flex flex-row items-center gap-x-2">
                    <MenubarMenu>
                        <MenubarTrigger>
                            <div className="flex flex-row items-center">
                                <LayoutTemplate className="w-5 h-5" />
                                <div className="ml-2"> Dashboard</div>
                            </div>
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>
                            <div className="flex flex-row items-center">
                                <BookCopy className="w-5 h-5" />
                                <div className="ml-2"> Collections</div>
                            </div>
                        </MenubarTrigger>
                    </MenubarMenu>
                </div>
                <div className="flex flex-row items-center gap-x-2">
                    <MenubarMenu>
                        <MenubarTrigger>
                            <Plus className="w-5 h-5" />
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>
                            <Search className="w-5 h-5" />
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>
                            <Bell className="w-5 h-5" />
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>
                            <Avatar>
                                <AvatarImage src="https://avatars.githubusercontent.com/u/86984205?v=4" />
                                <AvatarFallback>ES</AvatarFallback>
                            </Avatar>
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>
                            <ModeToggle />
                        </MenubarTrigger>
                    </MenubarMenu>
                </div>
            </Menubar>

            {/* Bottom Menu - Visible only below lg */}
            <Menubar className="fixed bottom-0 left-0 w-full flex flex-row justify-evenly items-center py-6 border-t border-x-0 rounded-none lg:hidden shadow-md z-50">
                <MenubarMenu>
                    <MenubarTrigger>
                        <div className="flex flex-row items-center">
                            <LayoutTemplate className="w-5 h-5" />
                        </div>
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>
                        <div className="flex flex-row items-center">
                            <BookCopy className="w-5 h-5" />
                        </div>
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>
                        <Plus className="w-5 h-5" />
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>
                        <Search className="w-5 h-5" />
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>
                        <Bell className="w-5 h-5" />
                    </MenubarTrigger>
                </MenubarMenu>
            </Menubar>

        </div>
    );
}

export default NavBar;
