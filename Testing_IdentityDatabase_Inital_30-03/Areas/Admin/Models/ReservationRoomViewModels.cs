using MVCControlsToolkit.DataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using Testing_IdentityDatabase_Inital_30_03.Models;

/// <summary>
/// View Models for the Reservation and Rooms section of the admin area
/// </summary>
namespace Testing_IdentityDatabase_Inital_30_03.Areas.Admin.Models
{
    /// <summary>
    /// An expanded Reservation View Model for the full Reservation representation
    /// </summary>
    public class ExpandedReservationDTO
    {

        public ExpandedReservationDTO()
        {
            Status = "Booked";
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [Display(Name = "Check In")]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        [DateRange(DynamicMaximum = "Departure", RangeAction = RangeAction.Propagate, SMinimum = "Today+2d")]
        public DateTime Arrival { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [Display(Name = "Check Out")]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        [DateRange(DynamicMinimum = "Arrival", SMinimumDelay = "1.00:00:00")]
        public DateTime Departure { get; set; }

        [Display(Name = "Total Bill")]
        [DataType(DataType.Currency)]
        public decimal TotalBill { get; set; }

        [Display(Name = "Amount Left To Pay")]
        [DataType(DataType.Currency)]
        public decimal LeftToPay { get; set; }

        [Display(Name = "Deposit Amount")]
        [DataType(DataType.Currency)]
        public decimal Deposit { get; set; }

        [Required]
        public string Status { get; set; }

        [Display(Name = "Any Extra Addons?")]
        public List<Extra> AllExtras { get; set; }

        public int[] SelectedExtra { get; set; }

        [Display(Name = "No of Guests")]
        public int NoOfGuests { get; set; }

        [Display(Name = "Extras")]
        public List<Extra> Extras { get; set; }

        //NAV
        [Required]
        [ForeignKey("ApplicationUsers")]
        [Display(Name = "User")]
        public string UserId { get; set; }
        public virtual ApplicationUser ApplicationUsers { get; set; }

        [Required]
        [ForeignKey("BoardType")]
        [Display(Name = "Board Type")]
        public int BoardTypeId { get; set; }
        public virtual BoardType BoardType { get; set; }

        [Required]
        [ForeignKey("Room")]
        [Display(Name = "Room")]
        public int RoomId { get; set; }
        public virtual Room Room { get; set; }


    }


    //public class UserReservationsDTO
    //{
    //    [Key]
    //    [Display(Name = "Role Name")]
    //    public int ReservationId { get; set; }
    //}

    /// <summary>
    /// Class that holds both users and their reservation
    /// </summary>
    public class UserReservationDTO
    {
        [Key]
        [Display(Name = "ApplicationUser Name")]
        public string UserName { get; set; }
        [Display(Name = "Reservation")]
        public int ReservationId { get; set; }
    }

    /// <summary>
    /// Class that represents users and a list of their reservations
    /// </summary>
    public class UserAndReservationDTO
    {
        [Key]
        [Display(Name = "ApplicationUser Name")]
        public string UserName { get; set; }
        public List<UserReservationDTO> colUserReservationDTO { get; set; }
    }

    /// <summary>
    /// An Expanded Room View model for full room representation
    /// </summary>
    public class ExpandedRoomDTO
    {

        [Key]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Room Cost per Night")]
        [DataType(DataType.Currency)]
        public decimal RoomCosts { get; set; }

        [Required]
        [Display(Name = "Room Number")]
        public string RoomNumber { get; set; }

        //NAV

        public virtual ICollection<Reservation> Reservations { get; set; }

        [Required]
        [ForeignKey("RoomType")]
        public int RoomTypeId { get; set; }
        public virtual RoomType RoomType { get; set; }
    }

    /// <summary>
    /// Expanded Room Type View Model for full room type representation
    /// </summary>
    public class ExpandedRoomTypeDTO
    {

        public ExpandedRoomTypeDTO()
        {

            Rooms = new List<Room>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Room Type")]
        public string Room_Type { get; set; }

        [Required]
        public string Capacity { get; set; }

        //NAV
        public virtual ICollection<Room> Rooms { get; set; }
    }

    /// <summary>
    /// A AllRooms DTO that contains a list of all the rooms
    /// </summary>
    public class AllRoomsDTO
    {
            public AllRoomsDTO()
            {

                 Rooms = new List<Room>();
            }

        public List<Room> Rooms { get; set; }

    }

    /// <summary>
    /// An Expanded Board Types view model for full board type representation
    /// </summary>
    public class ExpandedBoardTypesDTO
    {
        public ExpandedBoardTypesDTO()
        {

            Reservations = new List<Reservation>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Board Type")]
        [DataType(DataType.Currency)]
        public string Board_Type { get; set; }

        [Required]
        [Display(Name = "Board Costs per Night")]
        public decimal BoardCosts { get; set; }

        //NAV

        public List<Reservation> Reservations { get; set; }

    }

    /// <summary>
    /// A Class that contains a list of all board types
    /// </summary>
    public class AllBoardTypesDTO
    {
        public AllBoardTypesDTO()
        {

            BoardTypes = new List<BoardType>();
        }

        public List<BoardType> BoardTypes { get; set; }

    }



}