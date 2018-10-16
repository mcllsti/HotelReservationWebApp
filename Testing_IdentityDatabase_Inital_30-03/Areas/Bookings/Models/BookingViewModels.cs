using MVCControlsToolkit.Controls;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Testing_IdentityDatabase_Inital_30_03.Models;

namespace Testing_IdentityDatabase_Inital_30_03.Areas.Bookings.Models
{
    public class ConfirmDetailsDTO
    {
        [Key]
        public int id { get; set; }

        [Required]
        [ForeignKey("Room")]
        public int RoomId { get; set; }
        public virtual Room Room { get; set; }

        [Required]
        [ForeignKey("ApplicationUsers")]
        public string UserId { get; set; }
        public virtual ApplicationUser ApplicationUsers { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [Display(Name = "Check In")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime CheckIn { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [Display(Name = "Check Out")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime CheckOut { get; set; }

        public int Days { get; set; }


    }

    public class AddonDetailsDTO
    {


        [Key]
        public int id { get; set; }

        [Required]
        [ForeignKey("ApplicationUsers")]
        public string UserId { get; set; }
        public virtual ApplicationUser ApplicationUsers { get; set; }

        [Required]
        [ForeignKey("BoardType")]
        [Display(Name = "Board Type")]
        public int BoardTypeId { get; set; }
        public virtual BoardType BoardType { get; set; }

        [Required]
        [ForeignKey("Room")]
        public int RoomId { get; set; }
        public virtual Room Room { get; set; }

        [Required]
        [Display(Name = "Number of Guests")]
        public int NoOfGuests { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [Display(Name = "Check In")]
        public DateTime CheckIn { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [Display(Name = "Check Out")]
        public DateTime CheckOut { get; set; }

        public int Days { get; set; }

        [Display(Name = "Any Extra Addons?")]
        public List<Extra> AllExtras { get; set; }

        public int[] SelectedExtra { get; set; }

    }

    public class PaymentDetails
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Room Costs")]
        [DataType(DataType.Currency)]
        public decimal RoomCosts { get; set; }

        [Required]
        [Display(Name = "Board Costs")]
        [DataType(DataType.Currency)]
        public decimal BoardCosts { get; set; }

        [Required]
        [Display(Name = "Extras Costs")]
        [DataType(DataType.Currency)]
        public decimal BookingExtrasCost { get; set; }

        [Required]
        [Display(Name = "Total Costs")]
        [DataType(DataType.Currency)]
        public decimal TotalCost { get; set; }

        [Required]
        [Display(Name = "Deposit Amount Required")]
        [DataType(DataType.Currency)]
        public decimal DepositToPay { get; set; }

    }
}