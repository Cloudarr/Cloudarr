var userGroups = [];
var user = null;
var observer = null;

const processServices = () => {
    const services = document.querySelectorAll(".service");

    // Fix Spacing
    document.querySelectorAll(".services-list").forEach(
        lis => {lis.classList.remove("mt-3");}
    );

    services.forEach(service => {
        const descriptionElem = service.querySelector(".service-description");
        const tagsElem = service.querySelector(".service-tags");
        tagsElem.style.flexDirection = "row-reverse"; 
        // tagsElem.style.background = "#00000033";
        tagsElem.style.borderRadius = "5px";
        tagsElem.classList.remove("mr-2");
        tagsElem.classList.remove("gap-2");
        tagsElem.classList.remove("flex");
        tagsElem.classList.remove("flex-row");
        tagsElem.classList.add("px-1");
        

        // Remove default styling from status
        const statusElem = service.querySelector(".docker-status");
        if (statusElem && (statusElem.classList !== null)) {
            statusElem.classList.remove("bg-theme-500/10");
            statusElem.classList.remove("dark:bg-theme-900/50");
            statusElem.classList.remove("px-1.5");
            statusElem.classList.remove("py-0.5");
        
            // const status = document.createElement("span");
            // status.className = "service-health text-[16px] tag-icon mdi mdi-check-bold"
            // tagsElem.appendChild(status);
        }

        const siteElem = service.querySelector(".site-monitor-status");
        if (siteElem && (siteElem.classList !== null)) {
            siteElem.classList.remove("bg-theme-500/10");
            siteElem.classList.remove("dark:bg-theme-900/50");
            siteElem.classList.remove("px-1.5");
            siteElem.classList.remove("py-0.5");

        }
        const nameElem = service.querySelector(".service-name");
        if (nameElem && (nameElem.classList !== null)) {
            nameElem.classList.remove("px-2");
            nameElem.classList.remove("py-2");
            nameElem.classList.add("px-1");
            nameElem.classList.add("py-1");
        }

            // const titleElem = service.querySelector(".service-title");
        // titleElem.classList.add("mt-0");     
        
        const cardElem = service.querySelector(".service-card");
        cardElem.classList.remove("mb-2");
        cardElem.classList.add("mb-1");
        
        let description = descriptionElem.textContent;
        // Extract parts of the description
        let name, type, group, security;

        
        const startBracket = description.indexOf('[');
        const endBracket = description.indexOf(']');
        
        if (startBracket !== -1 && endBracket !== -1) {
            type = description.substring(startBracket + 1, endBracket).trim();
            description = description.substring(0, startBracket).trim() + description.substring(endBracket + 1).trim();
        }

        const startParen = description.indexOf('(');
        const endParen = description.indexOf(')');


        if (startParen !== -1 && endParen !== -1) {
            group = description.substring(startParen + 1, endParen).trim();
            description = description.substring(0, startParen).trim() + description.substring(endParen + 1).trim();
        }
        if (group && !userGroups.includes(group) && !userGroups.includes("admins")) {
            service.classList.add("hidden");            
        }

        const startAngle = description.indexOf('<');
        const endAngle = description.indexOf('>');

        if (startAngle !== -1 && endAngle !== -1) {
            security = description.substring(startAngle + 1, endAngle).trim();
            description = description.substring(0, startAngle).trim() + description.substring(endAngle + 1).trim();
        }

        name = description.trim();

        // Clear existing description text
        descriptionElem.textContent = '';

        // Create new elements for each part
        const nameSpan = document.createElement('span');
        nameSpan.className = 'service-description-span';
        nameSpan.textContent = name;

        descriptionElem.appendChild(nameSpan);
       

        if (type) {
            const typeSpan = document.createElement('span');
            typeSpan.className = 'service-type mdi mdi-network-outline mx-0 my-0 px-0 py-0 tooltip tooltip-type';
            typeSpan.setAttribute('data-tooltip', type);
            tagsElem.appendChild(typeSpan);
        }
        
        if (security) {
            const securitySpan = document.createElement('span');
            securitySpan.className = 'service-security mdi mdi-incognito mx-0 my-0 px-0 py-0 tooltip tooltip-security';
            securitySpan.setAttribute('data-tooltip', security);
            tagsElem.appendChild(securitySpan);
        }

        if (group) {
            const groupSpan = document.createElement('span');
            groupSpan.className = 'service-group mdi mdi-security mx-0 my-0 px-0 py-0 tooltip tooltip-group';
            groupSpan.setAttribute('data-tooltip', group);
            tagsElem.appendChild(groupSpan);
        }
        
    })

    // Hide empty groups
    const serviceGroups = document.querySelectorAll(".services-group");
    serviceGroups.forEach(serviceGroup => {
        let active_count = 0;
        const groupServices = serviceGroup.querySelectorAll(".service");
        groupServices.forEach(service => {
            if (!service.classList.contains("hidden")) {
                active_count += 1;
            }
        })
        if (active_count == 0) {
            serviceGroup.classList.add("hidden");
        }
    })
}; 





const classesToRemove = ['bg-theme-500/10', 'dark:bg-theme-900/50'];
function removeClasses(element) {
    if (!element.classList.length) {
        return null;
    }

    classesToRemove.forEach(cls => {
        if (element.classList.contains(cls)) {
            element.classList.remove(cls);
        }
    });
    
}

const callback = function(mutationsList) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            removeClasses(mutation.target);
        } else if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    removeClasses(node);
                    node.querySelectorAll('*').forEach(removeClasses);
                }
            });
        }
    }
};


async function getGroupData() {
    try {
        const response = await fetch(
            "/groups",
            {
                credentials: "include",
            }
        );
        if (!response.ok) {
            throw new Error('Response not OK: ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch Error', error);
        return null;
    }
}

var firstRun = true; 
var data = null;

async function applyStyle() {
    if (!data) {
        try {
            data = await getGroupData();
        } catch {
            console.log("Displaying local dashboard");
        }
    }
    
    if (data) {
        userGroups = data["groups"];
        user = data["user"];
    }

    // Add user icon, greeting, and logout button
    if (firstRun && data) {
        firstRun = false;
        // Hide tabs
        tabList = document.getElementById("myTab");
        let lis = tabList.querySelectorAll("li");
        let count = 0;
        let hiddencount = 0;
        lis.forEach((elem) => {
            count += 1;
            let but = elem.querySelector("button");
            let tabname = but.innerText;
            console.log(tabname);
            const startParen = tabname.indexOf('(');
            const endParen = tabname.indexOf(')');
            let groups = [];
            if (startParen !== -1 && endParen !== -1) {
                groups = tabname.substring(startParen + 1, endParen).trim();
                groups = groups.split(",");
                groups = groups.map(s => s.trim());
                console.log(groups);
                tabname = tabname.substring(0, startParen).trim() + tabname.substring(endParen + 1).trim();
                but.innerText = tabname;
            }
            console.log("GOT GROUPS [" + groups + "] (" + userGroups + ")");
            if (
                !(groups.length == 0)
                && !userGroups.includes("admins")
                && !userGroups.some(item => groups.includes(item))
            ) {
                console.log("Hiding Tab" + tabname);
                document.getElementById("tabs").classList.add("hidden");
                hiddencount += 1;
            }
        })
        if (hiddencount === (count - 1)) {
            // If only one tab shown
            console.log("Single tab hidding tablister");
            tabList.classList.add("hidden");
        }

        header = document.getElementById("information-widgets");
        header.classList.remove("m-5");
        header.classList.add("m-3.5")

        
        const widgetContainer = document.querySelector('.widget-container').querySelector('div');

        const groupsDiv = document.createElement("div");
        groupsDiv.className = "relative flex-none flex flex-row items-center mr-3 py-1.5 information-widget-resource cursor-pointer tooltip-bottom";
        let groupslist = "";
        userGroups.forEach((grp) => {
            groupslist += " - "+grp+"\n";
        })

        groupsDiv.setAttribute('data-tooltip', groupslist);

        const groupsIcon = document.createElement('i');
        groupsIcon.className = 'mdi mdi-account-group text-white account-icon';
        groupsDiv.appendChild(groupsIcon);

        const groupstextDiv = document.createElement("div");
        groupstextDiv.className = "ml-3 text-left text-white w-auto text-xs whitespace-nowrap";        
        groupstextDiv.innerHTML = "Member of&nbsp;<br><b>"+String(userGroups.length)+"</b>&nbsp;groups"
        groupsDiv.appendChild(groupstextDiv);


        // Add user icon / dropdown
        const userDiv = document.createElement("div");
        userDiv.className = "relative flex-none flex flex-row items-center mr-3 py-1.5 information-widget-resource cursor-pointer";

        const userIcon = document.createElement('i');
        userIcon.className = 'mdi mdi-account text-white account-icon';
        userDiv.appendChild(userIcon);

        const usernameDiv = document.createElement("div");
        usernameDiv.className = "flex flex-col ml-3 text-left text-white w-auto text-xs whitespace-nowrap pr-3";
        usernameDiv.textContent = "Welcome, ";
        const userB = document.createElement("b");
        userB.className = "capitalize";
        userB.textContent = user;
        usernameDiv.appendChild(userB);
        userDiv.appendChild(usernameDiv);

        // Add dropdown arrow
        const dropdownArrow = document.createElement('i');
        dropdownArrow.className = 'mdi mdi-chevron-down text-white ml-2 transition-transform';
        userDiv.appendChild(dropdownArrow);

        // Dropdown menu
        const dropdownDiv = document.createElement("div");
        dropdownDiv.className = "dropdown absolute menu-dropdown hidden rounded shadow-md";

        const dropdownMenu = document.createElement("ul");
        
        const menuItems = new Map([
            ["Change Password", "/change_password"],
            ["Logout", "/logout"]
        ]);

        menuItems.forEach((url, text) => {
            const menuLink = document.createElement("a");
            menuLink.href = url;
            
            const menuItem = document.createElement("li");
            menuItem.className = "px-4 py-2 cursor-pointer";
            menuItem.textContent = text;
            
            menuLink.appendChild(menuItem);
            dropdownMenu.appendChild(menuLink);
        });

        dropdownDiv.appendChild(dropdownMenu);
        userDiv.appendChild(dropdownDiv);

        widgetContainer.insertBefore(groupsDiv, widgetContainer.firstChild);
        widgetContainer.insertBefore(userDiv, widgetContainer.firstChild);

        // Toggle dropdown and arrow rotation on click
        userDiv.addEventListener('click', () => {
            dropdownDiv.classList.toggle('hidden');
            dropdownArrow.classList.toggle('rotate-180');
        });

        // Close the dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!userDiv.contains(event.target)) {
                dropdownDiv.classList.add('hidden');
                dropdownArrow.classList.remove('rotate-180');
            }
        });
        
        //Add logout button
        const wrapper = document.getElementById("widgets-wrap");
        
        const logoutDiv = document.createElement("div");
        logoutDiv.className = "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap widget-container"

        const logoutLink = document.createElement('a');
        logoutLink.href = "/logout";
        logoutDiv.appendChild(logoutLink);

        const logoutIcon = document.createElement('i');
        logoutIcon.className = 'mdi mdi-logout text-white logout-icon';
        logoutLink.appendChild(logoutIcon);

        wrapper.appendChild(logoutDiv);
    }

    let body = document.querySelector("body");
    processServices();
}   

var updateServices = () => {
    if (document.querySelectorAll(".service").length > 0) {
        let body = document.querySelector("body");
        processServices(body);
    } else {
        console.log("No Services");
    }
}
var checkId = setInterval(updateServices, 500);

applyStyle();