var rooms = new Array();
var items = new Array();
var inventory = new Array();
var visibleItems = new Array();
var currentroom = 1;
var torchlit = false;
var lightlit = false;
var CoatWorn = false;
var ropecut = false;
var BlueDoorOpen = false;
var RedDoorOpen = false;
var YouareDead= false;
var roomDirections = new Array("north", "east", "south", "west", "up", "down");
var verb="";
var object="";
var resulttext="";

const ItemNum = {
    jacket : 0,
    book : 1,
    fireplace : 2,
    bottle : 3,
    broken_bottle : 4, 
    red_key : 5,
    broom : 6,
    flashlight : 7,
    blue_key : 8,
    coat : 9,
    weight : 10,
    rope : 11,
    silver_key : 12,
    scraps : 13,
    torch : 14,
    batteries : 15
};

class Room 
{
    constructor (_roomNumber, _roomName, _roomDescription, _roomExits) 
    {
        this.roomNumber = _roomNumber;
        this.roomName = _roomName;
        this.roomDescription = _roomDescription;
        this.roomExits = _roomExits;
    } 
};

class Item
{ 
    constructor (_itemNumber, _itemName, _itemDescription, _itemDetail, _roomNumber) 
    {
        this.itemNumber = _itemNumber;
        this.itemName = _itemName;
        this.itemDescription = _itemDescription;
        this.itemDetail = _itemDetail;
        this.roomNumber = _roomNumber;
    } 
};

function updatedisplay()
{
    TooCold=(currentroom==12 || currentroom==13 || currentroom==14) && !CoatWorn;
    TooDark=(currentroom==7 || currentroom==9) && !HasLight();
    if (YouareDead)
    {
        TempName="Dead";
        TempDescription="Your torch catches the library on fire. You watch as the manor" +
        " is engulfed in flames. <br><br> Type 'restart' to try again.";
        TempExits=[0,0,0,0,0,0];
    }
    else if (TooCold)
    {
        TempName="Cold Room";
        TempDescription="It's too cold to think.";
        if (currentroom==12)
            TempExits=[11,0,0,0,0,0];
        else if (currentroom==13)
            TempExits=[0,0,0,12,0,0];
        else
            TempExits=[0,0,0,13,0,0];
    }
    else if (TooDark)
    {
        TempName="Dark Room";
        TempDescription="It's too dark to see anything.";
        if (currentroom==7)
            TempExits=[0,0,2,0,0,0];
        else
            TempExits=[0,0,7,0,0,0];    
    }
    else
    {
        TempName=rooms[currentroom].roomName;
        TempDescription=rooms[currentroom].roomDescription;
        TempExits=rooms[currentroom].roomExits;
    }
    document.getElementById("roomname").innerHTML = TempName;
    document.getElementById("roomdesc").innerHTML = TempDescription;
    var directions="";
    for(i=0;i<6;i++)
        if (TempExits[i]!=0)
            directions+=roomDirections[i] + " ";
    document.getElementById("roomexits").innerHTML = directions;

    var itemlist="";
    if (!TooCold && !TooDark && !YouareDead)
    {
        for (thisitem in items)
            if (items[thisitem].roomNumber==currentroom)
            {
                if (itemlist!="")
                    itemlist += ", ";
                itemlist+=items[thisitem].itemDescription;
            }
    }
    document.getElementById("roomitems").innerHTML = itemlist;

    var itemlist="";
    if (!TooCold && !TooDark && !YouareDead)
    {
        for (thisitem in items)
            if (items[thisitem].roomNumber==-1)
            {
                if (itemlist!="")
                    itemlist += ", ";
                itemlist+=items[thisitem].itemDescription;
        }
    }
    document.getElementById("invitems").innerHTML = itemlist;

    document.getElementById("result").innerHTML = resulttext;
}

function GetObjNum(ObjectName)
{
    for (thisitem in items)
        if (items[thisitem].itemName==ObjectName)
            return items[thisitem].itemNumber;
            
    resulttext="I don't know what item " + ObjectName + " is.";
    return -1;
}

function HasLight()
{
    if (torchlit && IsObjPresent(ItemNum.torch))
        return true;
    if (lightlit && IsObjPresent(ItemNum.flashlight))
        return true;
}

function IsObjPresent(ObjNum)
{
    if (items[ObjNum].roomNumber==-1)
        return true;
    else if (items[ObjNum].roomNumber==currentroom)
        return true;
    else
        return false;
}

function DoLook()
{
    var ObjectNumber=GetObjNum(object)
    if (ObjectNumber != -1)
    {
        if (IsObjPresent(ObjectNumber))
            resulttext=items[ObjectNumber].itemDetail;
        else
            resulttext=object +" isn't in this room.";
    }
}

function DoUse()
{
    var ObjectNumber=GetObjNum(object)
    if (ObjectNumber != -1)
    {
        if (items[ObjectNumber].roomNumber!=-1)
        {
            resulttext="I can't use something I don't have.";
            return;
        }
        if (ObjectNumber==ItemNum.jacket)
        {    
            resulttext="I put on the jacket.";
            items[ItemNum.jacket].itemDescription+=" (which I am wearing)";
        }
        else if (ObjectNumber==ItemNum.coat)
        {    
            resulttext="I put on the coat.";
            items[ItemNum.coat].itemDescription+=" (which I am wearing)";
            CoatWorn=true;
        }
        else if (ObjectNumber==ItemNum.batteries)
        {
            if (!IsObjPresent(ItemNum.flashlight))
            {
                resulttext="There's nothing to put the batteries into.";
                return;
            }
            else
            {
                resulttext="I put the batteries into the flashlight."
                lightlit=true
                items[ItemNum.flashlight].itemDescription="a lit flashlight"
                items[ItemNum.batteries].roomNumber=0
            }
        }
        else if (ObjectNumber==ItemNum.broken_bottle)
        {
            if (currentroom!=14)
                resulttext="I don't know what to use the bottle on.";
            else if (ropecut)
                resulttext="I already cut the rope."
            else
            {
                resulttext="I cut the rope, and the weight falls away.";
                ropecut=true;
                items[ItemNum.weight].roomNumber=0;
                items[ItemNum.rope].itemDescription="a cut rope."
                items[ItemNum.rope].itemDetail="The rope that once held the weight holding down" +
                " the dumbwaiter. It's cut in half now."

            }

        }
        else
            resulttext="I don't know how to use the " + object + "."

    }


}

function DoCut()
{
    var ObjectNumber=GetObjNum(object)
    if (ObjectNumber == -1)
        resulttext="I don't know what " + object + " is.";
   
    else if (items[ItemNum.broken_bottle].roomNumber!=-1)
        resulttext="I don't have anything to cut with.";  

    else if (ObjectNumber!=ItemNum.rope)
        resulttext="I can't cut that.";
    else
    {
        object="bottle";
        DoUse();
    }

}

function DoGet()
{
    var ObjectNumber=GetObjNum(object);
    if (ObjectNumber == -1)
        return;
    if (items[ObjectNumber].roomNumber!=currentroom)
    {
        resulttext=object + " isn't in this room.";
        return;
    }
    else if (ObjectNumber==ItemNum.fireplace || ObjectNumber==ItemNum.weight 
        || ObjectNumber==ItemNum.rope)
        resulttext="That's too heavy for me to pick up.";
    else
    {
        items[ObjectNumber].roomNumber=-1;
        resulttext="I took the " + object;
    }

}

function DoDrop()
{
    var ObjectNumber=GetObjNum(object);
    if (ObjectNumber == -1)
        return;
    if (items[ObjectNumber].roomNumber!=-1)
    {
        resulttext=object + " isn't in your inventory.";
        return;
    }
    else
    {
        if (ObjectNumber==ItemNum.coat && CoatWorn)
        {
            CoatWorn=false;
            items[ItemNum.coat].itemDescription="a winter coat."
        }
        else if (ObjectNumber==ItemNum.jacket)
            items[ItemNum.coat].itemDescription="a threadbare jacket."

        items[ObjectNumber].roomNumber=currentroom;
        resulttext="I dropped the " + object;
    }
   
}

function DoBreak()
{
    var ObjectNumber=GetObjNum(object);
    if (ObjectNumber != -1)
    {
        if (IsObjPresent(ObjectNumber))
            resulttext=items[ObjectNumber].itemDetail;
        else
        {
            resulttext=object +" isn't in this room.";
            return;
        }
    }
    if (ObjectNumber==ItemNum.jacket)
    {
        resulttext="I ripped the " + object;
        items[ItemNum.scraps].roomNumber=items[ObjectNumber].roomNumber;
        items[ObjectNumber].roomNumber=0;
        
    }
    else if (ObjectNumber==ItemNum.bottle)
    {
        resulttext="I broke the " + object;
        items[ItemNum.broken_bottle].roomNumber=items[ObjectNumber].roomNumber;
        items[ObjectNumber].roomNumber=0;
        items[ObjectNumber].itemName="";
    }
    else
    {
        resulttext="I can't " + verb + " that."
        return;
    }
}

function DoMake()
{
    var ObjectNumber=GetObjNum(object);
    if (ObjectNumber!=ItemNum.torch)
    {
        resulttext="I don't know how to make that."
        return;
    }
    else if (IsObjPresent(ItemNum.broom) && IsObjPresent(ItemNum.scraps))
    {
        resulttext="I made the torch, but it isn't lit yet.";
        items[ItemNum.broom].roomNumber=0
        items[ItemNum.scraps].roomNumber=0
        items[ObjectNumber].roomNumber=-1    
    }
    else
    {
        resulttext="I don't have the proper materials to make a torch.";
    }
}

function DoLight()
{
    var ObjectNumber=GetObjNum(object);
    if (ObjectNumber!=ItemNum.torch)
    {
        resulttext="Unfortunately, I can't do that."
        return;
    }
    else if (IsObjPresent(ItemNum.torch)==false)
    {
        resulttext="I can't light the torch, it isn't here."
        return;
    }
    else if (IsObjPresent(ItemNum.fireplace)==false)
    {
        resulttext="There's nothing to light the torch with.";
        return;
    }
    else
    {
        resulttext="I lit the torch.";
        torchlit=true;
        items[ItemNum.torch].itemDescription="a lit torch"; 

    }
}

function DoTele()
{
    currentroom=object-0;
    resulttext="I am now in room " + object;
}

function DoHelp()
{
    resulttext="In this game, you are attempting to leave the manor you find yourself" +
    " trapped in. To move through rooms you can say 'move' or" + 
    " 'go' and then the direction you want to move in. Alternatively," +
    " you can just type the first letter of the direction you want to go" +
    " in, such as 'n.' If you want to take an item, you can type" +
    " 'take' or 'get' followed by the" +
    " item you want to take. You can also drop items with 'drop.'" +
    " Try experimenting with different verbs if you get stuck."
}

function DoMove()
{
var directionNumber=0
if (verb=="n" || object=="north")
    directionNumber=0
else if (verb=="e" || object=="east")
    directionNumber=1
else if (verb=="s" || object=="south")
    directionNumber=2
else if (verb=="w" || object=="west")
    directionNumber=3
else if (verb=="u" || object=="up")
    directionNumber=4
else if (verb=="d" || object=="down")
    directionNumber=5 
else 
{
    resulttext="I don't know where you're trying to go.";
    return;
}


var newroom=rooms[currentroom].roomExits[directionNumber];
if (newroom==0)
    resulttext="I can't go that way.";
else if (currentroom==2 && directionNumber==3)
{
    if (!IsObjPresent(ItemNum.red_key) && !RedDoorOpen)
    {
        resulttext="My path is blocked by a locked red door.";
        return;
    }
    else 
    {
        if (!RedDoorOpen)
        {
            resulttext="I unlocked the red door with the corresponding key.";
            RedDoorOpen=true;
        }
        currentroom=newroom;
    }
}

else if (currentroom==7 && directionNumber==1)
{
    if (!IsObjPresent(ItemNum.blue_key) && !BlueDoorOpen)
    {
        resulttext="My path is blocked by a locked blue door.";
        return;
    }
    else 
    {
        if (!BlueDoorOpen)
        {
            resulttext="I unlocked the blue door with the corresponding key.";
            BlueDoorOpen=true;
        }
        currentroom=newroom;
    }
}

else if (currentroom==1 && directionNumber==2)
{
    if (!IsObjPresent(ItemNum.silver_key))
    {
        resulttext="My path is blocked by a large locked silver door.";
        return;
    }
    else 
    {
        currentroom=newroom;
    }
}

else if ((currentroom==4 && directionNumber==4) || (currentroom==4 && directionNumber==5) 
||(currentroom==14 && directionNumber==4))
{
    if (!ropecut)
        resulttext="I tried to use the dumbwaiter to move, but it seems to be weighed down" +
        " by something.";
    else
        {
        resulttext="I used the dumbwaiter to move somewhere else."
        currentroom=newroom;
        }
}

else currentroom=newroom;

if (currentroom==9 && IsObjPresent(ItemNum.torch) && torchlit)
    YouareDead=true;
}

function handleclick()
{
    resulttext="";
    var commandarray=command.value.split(" ");
    verb=commandarray[0];
    object=command.value.substring(verb.length + 1);
    command.value="";
    switch (verb)
    {
        case "look":
            DoLook();
            break;
        case "get": 
        case "take":
            DoGet(); 
            break;
        case "break":
        case "rip":
        case "tear":
            DoBreak();
            break;
        case "use":
            DoUse();
            break;
        case "cut":
            DoCut();
            break;
        case "light":
            DoLight();
            break;
        case "make":
        case "create":
            DoMake();
            break;
        case "drop":
            DoDrop();
            break;
        case "teleport":
            DoTele();
            break;
        case "help":
            DoHelp();
            break;
        case "move":
        case "go":
        case "n":
        case "s":
        case "e":
        case "w":
        case "u":
        case "d":
            DoMove();
            break;
        case "restart":
            setupgame();
            break;
        default:
            resulttext="I don't know how to " + verb
    }
    updatedisplay();
}

function setupgame() 
{
    currentroom=1
    var descriptionroom1 = "You are in the Foyer of the manor. The front door is locked" +
    " and all the windows in this place are boarded up.";
    var descriptionroom2 = "You are in the Living Room. Multiple soft seats are" +
    " placed around a single cofee table with various materials scattered on top of it.";
    var descriptionroom3 = "You are in the Dining Room. No plates or silverware" +
    " are placed on the table, but a single wine bottle sits there.";
    var descriptionroom4 = "You are in the Kitchen. Interestingly, there seems " +
    "to be no food in the cabinet or lying around. There appears to" +
    " be a dumbwaiter in the corner of the room.";
    var descriptionroom5 = "You are in the Broom Closet. Somewhat " +
    "ironically, it seems to be the dustiest place in the manor so far.";
    var descriptionroom6 = "You are in the Garage. The room is oddly barren," +
    " containing no car at all. A flashlight sits on a tower of unused paint cans.";
    var descriptionroom7 = "You are in the Game Room. Various card games are" +
    " strewn about the many small tables in the room, seemingly stopped mid-game.";
    var descriptionroom8 = "A long spiral staircase descends into the floor below.";
    var descriptionroom9 = "You are in the Library. Each bookshelf is packed with volumes" +
    " and extends far enough there are ladders for reaching them. A key sits on one of them.";
    var descriptionroom10 = "You are in the Laundry Room. Folded clothes sit in a" +
    " basket, waiting to be carried into a wardrobe.";
    var descriptionroom11 = "You are in the Basement Stairwell. You can feel cold air" +
    " trickling in from the other side of the door.";
    var descriptionroom12 = "You are in the Specimen Room. Dead animals are" +
    " preserved in cold storage.";
    var descriptionroom13 = "You are in the Pipe Room. The ceiling is covered in frozen pipes.";
    var descriptionroom14 = "You are in the Icebox. Frozen food sits in the many shelves of" +
    " this room. You spot a familiar dumbwaiter in" +
    " the corner of the room, held in place by a weight.";
    var descriptionroom15 = "You are in the Master Bedroom. The bed looks quite comfy," +
    " and its sheets seem very thick. The door to this place is bolted shut,";
    var descriptionroom16 = "Congratulations! You have successfully escaped the manor." +
    " If you would like to try again, type 'restart.'";
    colddescription = "It's too cold to think.";
    darkdescription = "It's too dark to see anything.";

    var room1 = new Room(1, "Foyer", descriptionroom1, [2, 0, 16, 0, 0, 0]);
    rooms[1] = room1;
    var room2 = new Room(2, "Living Room", descriptionroom2, [7, 3, 1, 5, 0, 0]);
    rooms[2] = room2;
    var room3 = new Room(3, "Dining Room", descriptionroom3, [0, 4, 0, 2, 0, 0,]);
    rooms[3] = room3;
    var room4 = new Room(4, "Kitchen", descriptionroom4, [0, 0, 0, 3, 15, 14]);
    rooms[4] = room4;
    var room5 = new Room(5, "Broom Closet", descriptionroom5, [8, 2, 6, 0, 0, 0]);
    rooms[5] = room5;    
    var room6 = new Room(6, "Garage", descriptionroom6, [5, 0, 0, 0, 0, 0]);
    rooms[6] = room6;
    var room7 = new Room(7, "Game Room", descriptionroom7, [9, 10, 2, 0, 0, 0]);
    rooms[7] = room7;
    var room8 = new Room(8, "Spiral Stairwell", descriptionroom8, [0, 0, 5, 0, 0, 11]);
    rooms[8] = room8;
    var room9 = new Room(9, "Library", descriptionroom9, [0, 0, 7, 0, 0, 0]);
    rooms[9] = room9;
    var room10 = new Room(10, "Laundry Room", descriptionroom10, [0, 0, 0, 7, 0, 0]);
    rooms[10] = room10;
    var room11 = new Room(11, "Basement Stairwell", descriptionroom11, [0, 0, 12, 0, 8, 0]);
    rooms[11] = room11;
    var room12 = new Room(12, "Specimen Room", descriptionroom12, [11, 13, 0, 0, 0, 0]);
    rooms[12] = room12;
    var room13 = new Room(13, "Pipe Room", descriptionroom13, [0, 14, 0, 12, 0, 0]);
    rooms[13] = room13;
    var room14 = new Room(14, "Icebox", descriptionroom14, [0, 0, 0, 13, 4, 0]);
    rooms[14] = room14;
    var room15 = new Room(15, "Master Bedroom", descriptionroom15, [0, 0, 0, 0, 0, 4]);
    rooms[15] = room15;
    var room16 = new Room(16, "Victory!", descriptionroom16, [0, 0, 0, 0, 0, 0]);
    rooms[16] = room16;
    bookdescripton = "You decide to thumb through the pages for a moment. One page reads:" +
    " To create a torch, you can wrap a scrap of cloth to" +
    " the end of a dry stick and light it on your campfire.";
    var item0 = new Item(0, "jacket", "a threadbare jacket",
     "This Jacket is so well worn, it's as if it's more holes than cloth.", 1);
    items[0] = item0;
    var item1 = new Item(1, "book", "a survival book", bookdescripton,  2);
    items[1] = item1;
    var item2 = new Item(2, "fireplace", "a large fireplace",
     "The fireplace crackles comfortingly.", 2);
    items[2] = item2;
    var item3 = new Item(3, "bottle", "a wine bottle",
     "An empty wine bottle. It looks expensive.", 3);
    items[3] = item3;
    var item4 = new Item(4, "bottle", "a broken bottle",
     "A broken bottle. Its jagged edges are quite sharp.",  0);
    items[4] = item4;
    var item5 = new Item(5, "red key", "a red key",
     "A red key. It's stained with some tomato sauce.", 4);
    items[5] = item5;
    var item6 = new Item(6, "broom", "an old broom",
     "An old dusty broom. It's quite dry.", 5);
    items[6] = item6;
    var item7 = new Item(7, "flashlight", "a flashlight",
     "A flashlight. It's out of power.", 6);
    items[7] = item7;
    var item8 = new Item(8, "blue key", "a blue key",
     "The key to the laundry room. It's blue coloration brings to mind the cold.", 9);
    items[8] = item8;
    var item9 = new Item(9, "coat", "a winter coat",
     "A winter coat. It should be able to keep you warm in frigid areas.", 10);
    items[9] = item9;
    var item10 = new Item(10, "weight", "a large and heavy weight",
     "The weight is holding the dumbwaiter in place, keeping it from moving anything.", 14);
    items[10] = item10;
    var item11 = new Item(11, "rope", "a rope holding the weight",
     "The rope is the only thing holding the weight in place.", 14);
    items[11] = item11;
    var item12 = new Item(12, "silver key", "a silver key",
     "Your way out. Its silver surface is clean enough to show your reflection in it.", 15);
    items[12] = item12;
    var item13 = new Item(13, "scraps", "cloth scraps",
     "Small cloth scraps. They used to be a jacket.", 0);
    items[13] = item13;
    var item14 = new Item(14, "torch", "unlit torch",
     "A freshly made torch. It isn't lit yet.", 0);
    items[14] = item14;
    var item15 = new Item(15, "batteries", "AA batteries",
     "A pair of AA batteries. They look rather old.", 7);
    items[15] = item15;
    
    currentroom = 1;
    torchlit = false;
    lightlit = false;
    CoatWorn = false;
    ropecut = false;
    BlueDoorOpen = false;
    RedDoorOpen = false;
    YouareDead= false;

    updatedisplay();
}