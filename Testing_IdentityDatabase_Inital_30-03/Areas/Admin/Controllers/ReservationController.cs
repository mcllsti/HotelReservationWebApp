using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using PagedList;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Testing_IdentityDatabase_Inital_30_03;
using Testing_IdentityDatabase_Inital_30_03.Areas.Admin.Models;
using Testing_IdentityDatabase_Inital_30_03.Controllers;
using Testing_IdentityDatabase_Inital_30_03.Extensions;
using Testing_IdentityDatabase_Inital_30_03.Models;


///IN CREATE VIEW MAKE IT SO THEY CAN CHECK BUTTON IF DEPOSIT IS PAID OR NOT!

/// <summary>
/// Controller that deals with the reservation and rooms section of the admin area
/// </summary>
namespace Testing_IdentityDatabase_Inital_30_03.Areas.Admin.Controllers
{

    public class ReservationController : BaseController
    {

        /// <summary>
        /// Returns a list of all the reservations or list of reservations with the search params
        /// </summary>
        /// <param name="searchString">String of the search params</param>
        /// <param name="currentFilter">The current filters on</param>
        /// <param name="page">Page Number</param>
        /// <returns>View with model</returns>
        [Authorize(Roles = "Administrator")]
        //public ActionResult Index(string searchString)
        public ActionResult Index(string searchString, string currentFilter, int? page)
        {
            try
            {

                int intPage = 1;
                int intPageSize = 5;
                int intTotalPageCount = 0;

                if (searchString != null) //if no search params
                {
                    intPage = 1;
                }
                else
                {
                    if (currentFilter != null) //if no current filters on search
                    {
                        searchString = currentFilter;
                        intPage = page ?? 1;
                    }
                    else
                    {
                        searchString = "";
                        intPage = page ?? 1;
                    }
                }

                ViewBag.CurrentFilter = searchString;


                List<ExpandedReservationDTO> col_ReservationDTO = new List<ExpandedReservationDTO>();
                int intSkip = (intPage - 1) * intPageSize;

                intTotalPageCount = context.Reservations
                    .Where(x => x.ApplicationUsers.UserName.Contains(searchString))
                    .Count();

                var result = context.Reservations //gets results of the search params
                    .Where(x => x.ApplicationUsers.UserName.Contains(searchString))
                    .OrderBy(x => x.ApplicationUsers.UserName)
                    .Skip(intSkip)
                    .Take(intPageSize)
                    .ToList();



                foreach (var item in result)
                {
                    ExpandedReservationDTO objReservationDTO = new ExpandedReservationDTO();

                    objReservationDTO.Arrival = item.Arrival;
                    objReservationDTO.Id = item.Id;
                    objReservationDTO.Departure = item.Depature;
                    objReservationDTO.BoardType = item.BoardType;
                    objReservationDTO.ApplicationUsers = UserManager.FindById(item.UserId);
                    objReservationDTO.Room = item.Room;
                    objReservationDTO.TotalBill = item.TotalBill;
                    objReservationDTO.LeftToPay = item.LeftToPay;
                    objReservationDTO.Deposit = item.Deposit;

                    col_ReservationDTO.Add(objReservationDTO);
                }

                // Set the number of pages
                var _UserDTOAsIPagedList =
                    new StaticPagedList<ExpandedReservationDTO>
                    (
                        col_ReservationDTO, intPage, intPageSize, intTotalPageCount
                        );

                return View("Index", _UserDTOAsIPagedList);
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }

        #region Reservation CRUD

        /// <summary>
        /// Retruns a create view form for reservations
        /// </summary>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        // public ActionResult Create()
        public ActionResult CreateView()
        {
            ExpandedReservationDTO reservationDTO = new ExpandedReservationDTO { Arrival = DateTime.Today, Departure = DateTime.Today};

            //Sets viewbags for selectlists of board, users and rooms

            int max = 4;
            List<SelectListItem> NoOfGuests = new List<SelectListItem>();
            for (int a = 1; a <= max; a++)
            {
                NoOfGuests.Add(new SelectListItem { Value = a.ToString(), Text = a.ToString() });
            }
            ViewBag.NoOfGuests = new SelectList(NoOfGuests, "Value", "Text");


            //Gets only the Extras that are allowed at booking
            reservationDTO.AllExtras = context.Extras.Where(x => x.Bookable == true).ToList();

            ViewBag.BoardTypeId = new SelectList(context.BoardTypes, "Id", "Board_Type");

            ViewBag.UserId = new SelectList(context.Users, "Id", "FirstName");

            ViewBag.RoomId =
                                 from u in context.Rooms
                                 select new SelectListItem
                                 {
                                     Value = u.Id.ToString(),
                                     Text = u.RoomType.Room_Type + " - No. " + u.RoomNumber
                                 };

            return View("CreateView",reservationDTO);
        }

        /// <summary>
        /// POST for creating a reservation
        /// </summary>
        /// <param name="reservationDTO">Reservation details to be created</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateView(ExpandedReservationDTO reservationDTO,bool paid)
        {
            try
            {
                if (reservationDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                if(reservationDTO.NoOfGuests > context.RoomTypes.Find(context.Rooms.Find(reservationDTO.RoomId).RoomTypeId).Capacity)
                {
                    this.AddNotification("The Number of guests must be less than the capacity of the room!", NotificationType.ERROR);
                    ViewBag.Error = "The Number of guests must be less than the capacity of the room!";
                    return Redirect("CreateView");
                }

                var e = new Reservation //Sets reservcation
                {
                    Arrival = reservationDTO.Arrival,
                    Depature = reservationDTO.Departure,
                    UserId = reservationDTO.UserId,
                    ApplicationUsers = context.Users.Find(reservationDTO.UserId),
                    BoardTypeId = reservationDTO.BoardTypeId,
                    BoardType = context.BoardTypes.Find(reservationDTO.BoardTypeId),
                    RoomId = reservationDTO.RoomId,
                    Room = context.Rooms.Find(reservationDTO.RoomId),
                    NoOfGuests = reservationDTO.NoOfGuests,
                };

                if(paid == true)
                {
                    e.TotalBill = e.CalculateBookingBill((e.Depature - e.Arrival).Days);
                    e.Deposit = e.CalculateDepositAmount((e.Depature - e.Arrival).Days);
                    e.LeftToPay = e.TotalBill - e.Deposit;
                }
                else
                {
                    e.TotalBill = e.CalculateBookingBill((e.Depature - e.Arrival).Days);
                    e.Deposit = e.CalculateDepositAmount((e.Depature - e.Arrival).Days);
                    e.LeftToPay = e.TotalBill;
                }



                if (reservationDTO.SelectedExtra != null)
                {
                    foreach (int id in reservationDTO.SelectedExtra)
                    {

                        e.Extras.Add(context.Extras.Where(x => x.Id == id).FirstOrDefault());
                    }
                }

                if (OccupiedRoom(e) == true) //checks if occupied
                {
                    this.AddNotification("That room is already occupied on that date!", NotificationType.ERROR);
                    ViewBag.Error = "That room is already occupied on that date!";
                    return Redirect("CreateView");

                }
                else
                {
                    context.Reservations.Add(e);
                    context.SaveChanges();
                    return Redirect("Index");
                }

            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }

        }

        /// <summary>
        /// Returns current details and edit view
        /// </summary>
        /// <param name="Id">Id of reservation to be edited</param>
        /// <returns>View with model</returns>
        [Authorize(Roles = "Administrator")]
        [HttpGet]
        // public ActionResult EditReservation(int Id)
        public ActionResult EditReservation(int Id)
        {
            if (Id == 0)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }

            var ToBeEdited = context.Reservations.Find(Id);

            ExpandedReservationDTO objReservationbDTO = new ExpandedReservationDTO //Sets reservation to viewmodel
            {
                Id = ToBeEdited.Id,
                Arrival = ToBeEdited.Arrival,
                Departure = ToBeEdited.Depature,
                UserId = ToBeEdited.UserId,
                ApplicationUsers = ToBeEdited.ApplicationUsers,
                RoomId = ToBeEdited.RoomId,
                Room = ToBeEdited.Room,
                BoardTypeId = ToBeEdited.BoardTypeId,
                BoardType = ToBeEdited.BoardType,
                
            };

            //Viewbags for select lists for Boardtypes and Room
            ViewBag.BoardTypeId = new SelectList(context.BoardTypes, "Id", "Board_Type", objReservationbDTO.BoardTypeId);
            ViewBag.RoomId = new SelectList(context.Rooms, "Id","RoomNumber", objReservationbDTO.RoomId);

            if (objReservationbDTO == null)
            {
                return HttpNotFound();
            }
            return View("EditReservation", objReservationbDTO);
        }

        /// <summary>
        /// POST for edit reservation that will set changes or a reservation
        /// </summary>
        /// <param name="objReservationbDTO">ExpandedReservation</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult EditReservation([Bind(Include = "Id,Depature,Arrival,UserId,BoardTypeId,RoomId")] ExpandedReservationDTO objReservationbDTO)
        {
            try
            {
                if (objReservationbDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                var change = context.Reservations.Find(objReservationbDTO.Id);
                if (change == null)
                {
                    return HttpNotFound();
                }

                //Updates details
                change.Arrival = objReservationbDTO.Arrival;
                change.BoardType = objReservationbDTO.BoardType;
                change.BoardTypeId = objReservationbDTO.BoardTypeId;
                change.Depature = objReservationbDTO.Departure;
                change.RoomId = objReservationbDTO.RoomId;
                change.Room = objReservationbDTO.Room;

                if (OccupiedRoom(change)) //Throws error if new room booked
                {
                    throw new Exception("error");
                }
                else
                {
                    context.SaveChanges();
                }

                return MoreDetails(objReservationbDTO.Id);


            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }


        /// <summary>
        /// Displays more details of a reservation
        /// </summary>
        /// <param name="Id">Id of reservation to view</param>
        /// <returns>Vie with model</returns>
        [Authorize(Roles = "Administrator")]
        [HttpGet]
        public ActionResult MoreDetails(int Id)
        {
            if (Id == 0)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var ToBeEdited = context.Reservations.Find(Id);


            //Sets reservation into view model
            ExpandedReservationDTO objReservationbDTO = new ExpandedReservationDTO
            {
                Id = ToBeEdited.Id,
                Arrival = ToBeEdited.Arrival,
                Departure = ToBeEdited.Depature,
                UserId = ToBeEdited.UserId,
                ApplicationUsers = ToBeEdited.ApplicationUsers,
                RoomId = ToBeEdited.RoomId,
                Room = ToBeEdited.Room,
                BoardTypeId = ToBeEdited.BoardTypeId,
                BoardType = ToBeEdited.BoardType,
                Status = ToBeEdited.Status,
                Extras = ToBeEdited.Extras.ToList(),
                Deposit = ToBeEdited.Deposit,
                LeftToPay = ToBeEdited.LeftToPay,
                TotalBill = ToBeEdited.TotalBill
            };
            if (objReservationbDTO == null)
            {
                return HttpNotFound();
            }
            return View("MoreDetails", objReservationbDTO);
        }

        /// <summary>
        /// Removes a reservation 
        /// </summary>
        /// <param name="Id">int id of reservation to be removed</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        public ActionResult DeleteReservation(int Id)
        {
            try
            {

                var copyRemoving = context.Reservations.Find(Id);
                context.Reservations.Remove(copyRemoving); //Remmoves and saves
                context.SaveChanges();

                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }



        #endregion


        #region Rooms CRUD
        /// <summary>
        /// A list of all rooms to be edited or viewed
        /// </summary>
        /// <returns>view with model</returns>
        [Authorize(Roles = "Administrator")]
        public ActionResult EditRooms()
        {
            AllRoomsDTO roomsDTO = new AllRoomsDTO(); //To store all rooms
            var rooms = context.Rooms.ToList();
            
            foreach(Room r in rooms)
            {
                roomsDTO.Rooms.Add(r);
            }

            return View("EditRooms", roomsDTO);
        }

        /// <summary>
        /// Returns view of form to create a room
        /// </summary>
        /// <returns>View with model</returns>
        [Authorize(Roles = "Administrator")]
        // public ActionResult Create()
        public ActionResult AddRoom()
        {
            ExpandedRoomDTO AddRoomDTO = new ExpandedRoomDTO();
            ViewBag.RoomTypeId = new SelectList(context.RoomTypes, "Id", "Room_Type"); //Select list of room types

            return View("AddRoom",AddRoomDTO);
        }

        /// <summary>
        /// POST to create a room from the form details
        /// </summary>
        /// <param name="AddRoomDTO">ExpandedRoomDTO of details of new room</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult AddRoom(ExpandedRoomDTO AddRoomDTO)
        {

            try
            {
                if (AddRoomDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                if(context.Rooms.Any(x => x.RoomNumber == AddRoomDTO.RoomNumber))
                {
                    this.AddNotification("", NotificationType.ERROR);
                    ViewBag.Error = "Room Exists with that room number";
                    return View("~/Views/Shared/Error.cshtml");
                }

                var e = new Room //Creates the new room
                {
                    RoomTypeId = AddRoomDTO.RoomTypeId,
                    RoomCosts = AddRoomDTO.RoomCosts,
                    RoomNumber = AddRoomDTO.RoomNumber
                };

                context.Rooms.Add(e);
                context.SaveChanges();
                return Redirect("Index");
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }

        /// <summary>
        /// Returns a view with chosen room details to be edited
        /// </summary>
        /// <param name="Id">Int id of room to be edited</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        [HttpGet]
        public ActionResult AlterRooms(int Id)
        {
            if (Id == 0)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var ToBeEdited = context.Rooms.Find(Id);

            ExpandedRoomDTO objExpandedRoomDTO = new ExpandedRoomDTO { //set details to ExpandedRoomDTO
                RoomCosts = ToBeEdited.RoomCosts,
                RoomTypeId = ToBeEdited.RoomTypeId,
                RoomNumber = ToBeEdited.RoomNumber,
                RoomType = ToBeEdited.RoomType
            };

            //Select list viewbag for roomtype
            ViewBag.RoomTypeId = new SelectList(context.RoomTypes, "Id", "Room_Type",ToBeEdited.RoomTypeId);

            if (objExpandedRoomDTO == null)
            {
                return HttpNotFound();
            }
            return View("AlterRooms", objExpandedRoomDTO);
        }

        /// <summary>
        /// POST for altering a rooms details using the params
        /// </summary>
        /// <param name="objExpandedRoomDTO">ExpandedRoomDTO of details to edit</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult AlterRooms(ExpandedRoomDTO objExpandedRoomDTO)
        {
            try
            {
                if (objExpandedRoomDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                var change = context.Rooms.Find(objExpandedRoomDTO.Id); //finds the room to changes
                if (change == null)
                {
                    return HttpNotFound();
                }

                //Changes
                change.RoomCosts = objExpandedRoomDTO.RoomCosts;
                change.RoomNumber = objExpandedRoomDTO.RoomNumber;
                change.RoomTypeId = objExpandedRoomDTO.RoomTypeId;
                change.RoomType = objExpandedRoomDTO.RoomType;
                context.SaveChanges();


                return EditRooms();
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }

        /// <summary>
        /// Deletes a Chosen Room
        /// </summary>
        /// <param name="Id">int Id of room to delete</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        public ActionResult DeleteRooms(int Id)
        {
            try
            {
                var copyRemoving = context.Rooms.Find(Id);
                context.Rooms.Remove(copyRemoving);
                context.SaveChanges();

                return EditRooms();
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }

        #endregion


        #region BoardTypes CRUD

        /// <summary>
        /// Gets a list of boardtypes to be edited or viewed
        /// </summary>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        public ActionResult EditBoardTypes()
        {
            AllBoardTypesDTO BoardTypeDTO = new AllBoardTypesDTO();
            var BoardTypes = context.BoardTypes.ToList();

            foreach (BoardType b in BoardTypes) //Puts all boardtypes into a list wihtin view model
            {
                BoardTypeDTO.BoardTypes.Add(b);
            }

            return View("EditBoardTypes", BoardTypeDTO);
        }

        /// <summary>
        /// Returns a Create Board Type view
        /// </summary>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        // public ActionResult Create()
        public ActionResult AddBoardType()
        {
            ExpandedBoardTypesDTO AddBoardTypeDTO = new ExpandedBoardTypesDTO();

            return View("AddBoardType", AddBoardTypeDTO);
        }

        /// <summary>
        /// POST method for adding a new board type
        /// </summary>
        /// <param name="AddBoardTypeDTO">ExpandedBoardTypesDTo to be added</param>
        /// <returns></returns>
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult AddBoardType(ExpandedBoardTypesDTO AddBoardTypeDTO)
        {

            try
            {
                if (AddBoardTypeDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                if (context.BoardTypes.Any(x => x.Board_Type == AddBoardTypeDTO.Board_Type))
                {
                    this.AddNotification("", NotificationType.ERROR);
                    ViewBag.Error = "Board Type Exists with that Board Type";
                    return View("~/Views/Shared/Error.cshtml");
                }

                var e = new BoardType //Creates the new board type
                {
                    Board_Type = AddBoardTypeDTO.Board_Type,
                    BoardCosts = AddBoardTypeDTO.BoardCosts,
                };

                context.BoardTypes.Add(e);
                context.SaveChanges(); //saves
                return Redirect("Index");

            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }

        /// <summary>
        /// Returns form to alter a board types details
        /// </summary>
        /// <param name="Id">int Id of board type to be altered</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        [HttpGet]
        public ActionResult AlterBoardTypes(int Id)
        {
            if (Id == 0)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var ToBeEdited = context.BoardTypes.Find(Id); //finds board type

            ExpandedBoardTypesDTO objExpandedBoardTypeDTO = new ExpandedBoardTypesDTO{ Board_Type = ToBeEdited.Board_Type, Id = ToBeEdited.Id, BoardCosts = ToBeEdited.BoardCosts};

            if (objExpandedBoardTypeDTO == null)
            {
                return HttpNotFound();
            }

            return View("AlterBoardTypes", objExpandedBoardTypeDTO);
        }

        /// <summary>
        /// POST for altering a board type with the provided params
        /// </summary>
        /// <param name="objExpandedBoardTypeDTO">ExpandedBoardTypesDTo of details to edit</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult AlterBoardTypes(ExpandedBoardTypesDTO objExpandedBoardTypeDTO)
        {
            try
            {
                if (objExpandedBoardTypeDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                var change = context.BoardTypes.Find(objExpandedBoardTypeDTO.Id); //Gets board type to edit
                if (change == null)
                {
                    return HttpNotFound();
                }
                change.BoardCosts = objExpandedBoardTypeDTO.BoardCosts;
                change.Board_Type = objExpandedBoardTypeDTO.Board_Type;
                context.SaveChanges(); //Saves changes


                return EditBoardTypes();

            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }


        /// <summary>
        /// Deletes a board type
        /// </summary>
        /// <param name="Id">int id of board type to be deleted</param>
        /// <returns>View</returns>
        [Authorize(Roles = "Administrator")]
        public ActionResult DeleteBoardType(int Id)
        {
            try
            {

                var copyRemoving = context.BoardTypes.Find(Id);
                context.BoardTypes.Remove(copyRemoving); //Removes
                context.SaveChanges(); //saves

                return EditBoardTypes();
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }



        #endregion

        #region CheckIn and Out

        public ActionResult CheckIn(int Id)
        {

            try
            {
                Reservation currentRes = context.Reservations.Find(Id);
                currentRes.Status = "CheckedIn";
                EmailWelcomePack(currentRes).Wait();
                return RedirectToAction("MoreDetails", new { Id = currentRes.Id});
            }
            catch(Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }

        }

        public ActionResult DepositCheckIn()
        {
            return View();
        }




        #endregion


        #region Utility

        /// <summary>
        /// Checks if the room is occupied during supplied dates
        /// </summary>
        /// <param name="CurrentReservation">Reservation model that contains proposed reservation details</param>
        /// <returns>True or False</returns>
        private bool OccupiedRoom(Reservation CurrentReservation)
        {
            var currentBooking = context.Reservations //LINQ Expression to find if occupied
                .Where(b => b.RoomId == CurrentReservation.RoomId)
                .Select(b => (b.Arrival <= CurrentReservation.Arrival && b.Depature >= CurrentReservation.Arrival) ||
                             (b.Arrival < CurrentReservation.Depature && b.Depature >= CurrentReservation.Depature) ||
                             (CurrentReservation.Arrival <= b.Arrival && CurrentReservation.Depature >= b.Arrival)

                )
                .FirstOrDefault();

            return currentBooking;
        }

        private async Task EmailWelcomePack(Reservation res)
        {
            var apiKey = System.Configuration.ConfigurationManager.AppSettings["mailKey"];
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(System.Configuration.ConfigurationManager.AppSettings["mailSentFrom"], "Drovers Lodge"); //gets email from the web.config
            var subject = "Drovers Inn Check In";
            var to = new EmailAddress(res.ApplicationUsers.Email, res.ApplicationUsers.FirstName);
            var plainTextContent = " ";
            var htmlContent = "Thank you for checking into your room at Drovers lodge! Just to remind you, your room number is: " + res.Room.RoomNumber + " and you check out on the " 
                               + res.Depature.ToShortDateString() + ". We have attached our digital welcome pack because we think saving trees is awesome.<br/> "
                               + "We hope you enjoy your stay!";
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

            Byte[] bytes = System.IO.File.ReadAllBytes(Server.MapPath("~/Content/Attachments/WelcomePack.pdf"));
            msg.AddAttachment("Welcome Pack.pdf", Convert.ToBase64String(bytes), "application/pdf");

            var response = await client.SendEmailAsync(msg).ConfigureAwait(continueOnCapturedContext: false); // .configureawait ensures that the code does not get blocked up
        }
    

        private ApplicationUserManager __userManager;
        /// <summary>
        /// Instilises Usermanager
        /// </summary>
        public ApplicationUserManager UserManager
        {
            get
            {
                return __userManager ??
                    HttpContext.GetOwinContext()
                    .GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                __userManager = value;
            }
        }
        #endregion





    }
}