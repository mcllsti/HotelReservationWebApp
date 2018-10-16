using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Testing_IdentityDatabase_Inital_30_03.Areas.Bookings.Models;
using Testing_IdentityDatabase_Inital_30_03.Controllers;
using Testing_IdentityDatabase_Inital_30_03.Models;


namespace Testing_IdentityDatabase_Inital_30_03.Areas.Bookings.Controllers
{
    public class AvailabilityController : BaseController
    {

        /// <summary>
        /// Returns the view the user will input details for
        /// </summary>
        /// <returns>View</returns>
        // GET: Bookings/Availability
        public ActionResult Check()
        {
            //Sets up the objAvailabilityDTO for todays dates.
            AvailabilityDTO objAvailabilityDTO = new AvailabilityDTO { Arrival = DateTime.Today, Departure = DateTime.Today };
            ViewBag.RoomTypeId = new SelectList(context.RoomTypes, "Id", "Room_Type");


            return View(objAvailabilityDTO);
        }


        /// <summary>
        /// Returns the partial view of the results
        /// </summary>
        /// <param name="objAvailabilityDTO">AvailabilityDTO of the users paramaters for searching</param>
        /// <returns>Partial View</returns>
        // [HttpPost]
        public PartialViewResult GetResults(AvailabilityDTO objAvailabilityDTO)
        {

            //Gets all rooms with the same room type that have no bookings between the selected dates
            var temprooms = context.Rooms.Where(r => r.RoomTypeId == objAvailabilityDTO.RoomTypeId).Where(m => m.Reservations.All(r => r.Depature <= objAvailabilityDTO.Arrival || r.Arrival >= objAvailabilityDTO.Departure));

            List<Room> rooms = new List<Room>();
            foreach (Room r in temprooms)
            {
                rooms.Add(r);
            }

            ResultsDTO results = new ResultsDTO { AvailableRooms = rooms, Arrival = objAvailabilityDTO.Arrival, Departure = objAvailabilityDTO.Departure };

            if(!results.AvailableRooms.Any())
            {
                ViewBag.Any = "There is no available rooms during this time! ";
            }

            //returns the partial view to be displayed with Ajax dynamically
            return PartialView("_Results", results);
        }

    }

}