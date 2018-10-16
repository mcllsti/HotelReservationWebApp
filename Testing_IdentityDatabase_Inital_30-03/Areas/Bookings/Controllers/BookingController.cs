using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Testing_IdentityDatabase_Inital_30_03.Areas.Bookings.Models;
using Testing_IdentityDatabase_Inital_30_03.Models;
using MVCControlsToolkit.Controls;
using System.Net;
using Braintree;
using System.Threading.Tasks;
using SendGrid;
using SendGrid.Helpers.Mail;
using Testing_IdentityDatabase_Inital_30_03.Controllers;
using static System.Net.WebRequestMethods;
using System.Web.Security;
using Testing_IdentityDatabase_Inital_30_03.Extensions;

namespace Testing_IdentityDatabase_Inital_30_03.Areas.Bookings.Controllers
{
    public class BookingController : BaseController
    {

        public IBraintreeConfiguration config = new BraintreeConfiguration();


        // GET: Bookings/Booking
        /// <summary>
        /// Will return a list of details that a user will review and confirm
        /// </summary>
        /// <param name="Id">Room Id</param>
        /// <param name="Arrival">Arrival Date</param>
        /// <param name="Departure">Departure Date</param>
        /// <returns>ConfirmDetailsDTO ViewModel</returns>
        [Authorize]
        public ActionResult ConfirmDetails(int Id, DateTime Arrival, DateTime Departure)
        {


            try
            {

                //Block sets the new ConfirmDetailsDTO object using provided paramaters
                ConfirmDetailsDTO objDetailsDTO = new ConfirmDetailsDTO();
                objDetailsDTO.CheckIn = Arrival;
                objDetailsDTO.CheckOut = Departure;
                objDetailsDTO.RoomId = Id;
                objDetailsDTO.UserId = User.Identity.GetUserId();
                objDetailsDTO.Days = (Departure - Arrival).Days;
                objDetailsDTO.Room = context.Rooms.Find(Id);
                objDetailsDTO.ApplicationUsers = context.Users.Find(objDetailsDTO.UserId);

                if (objDetailsDTO.ApplicationUsers == null)
                {
                    this.AddNotification("Please relogin.", NotificationType.ERROR);
                    FormsAuthentication.SignOut();
                    return RedirectToAction("Login", "Account", new { area = "" });

                }


                return View(objDetailsDTO);
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }


        /// <summary>
        /// Will build the addtional details form so the user can see the options available
        /// </summary>
        /// <param name="objConfirm">ConfirmDetailsDTO Object to build the Additional Details</param>
        /// <returns>AdditionalDeatailsDTO View Model </returns>
        public ActionResult GetAddtionalDetails(ConfirmDetailsDTO objConfirm)
        {
            try
            {

                //Builds AddonDetailsDTO using objConfirm params
                AddonDetailsDTO addonDTO = new AddonDetailsDTO
                {
                    UserId = objConfirm.UserId,
                    ApplicationUsers = context.Users.Find(objConfirm.UserId),
                    RoomId = objConfirm.RoomId,
                    Room = context.Rooms.Find(objConfirm.RoomId),
                    CheckIn = objConfirm.CheckIn,
                    CheckOut = objConfirm.CheckOut,
                    Days = objConfirm.Days

                };

                //Gets viewbag data for the select list of all the board types
                ViewBag.BoardTypeId =
                                     from u in context.BoardTypes
                                     select new SelectListItem
                                     {
                                         Value = u.Id.ToString(),
                                         Text = u.Board_Type + " - Per Night £" + u.BoardCosts
                                     };



                //Gets the number of guests a person can choose from based on the maximum capacity of the room
                int max = addonDTO.Room.RoomType.Capacity;
                List<SelectListItem> NoOfGuests = new List<SelectListItem>();
                for (int a = 1; a <= max; a++)
                {
                    NoOfGuests.Add(new SelectListItem { Value = a.ToString(), Text = a.ToString() });
                }
                ViewBag.NoOfGuests = new SelectList(NoOfGuests, "Value", "Text");


                //Gets only the Extras that are allowed at booking
                addonDTO.AllExtras = context.Extras.Where(x => x.Bookable == true).ToList();



                return View(addonDTO);
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }
        }


        /// <summary>
        /// The post method for GetAdditional Details that takes in the results of the form
        /// </summary>
        /// <param name="objAddons">The populated AdddonDetailsDTO View Model</param>
        /// <returns>PaymentDetails view model</returns>
        [Authorize]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult GetAddtionalDetails(AddonDetailsDTO objAddons)
        {
            try
            {
                if (objAddons == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                //Builds Reservation obj from objAddons param
                Reservation tempReservation = new Reservation
                {
                    Arrival = objAddons.CheckIn,
                    Depature = objAddons.CheckOut,
                    NoOfGuests = objAddons.NoOfGuests,
                    RoomId = objAddons.RoomId,
                    Room = context.Rooms.Find(objAddons.RoomId),
                    UserId = objAddons.UserId,
                    ApplicationUsers = context.Users.Find(objAddons.UserId),
                    BoardTypeId = objAddons.BoardTypeId,
                    BoardType = context.BoardTypes.Find(objAddons.BoardTypeId),     
                };

                //Checks to see if there was any selected extras and adds them if so
                if(objAddons.SelectedExtra != null)
                {
                    foreach (int id in objAddons.SelectedExtra)
                    {

                        tempReservation.Extras.Add(context.Extras.Where(x => x.Id == id).FirstOrDefault());
                    }
                }

                //Buillds PaymentDetails object using Reservation Functions
                PaymentDetails objPaymentDTO = new PaymentDetails
                {
                    RoomCosts = tempReservation.calculateRoomCosts(objAddons.Days),
                    BoardCosts = tempReservation.CalculateBoardCosts(objAddons.Days),
                    BookingExtrasCost = tempReservation.CalculateBookingExtraCosts(objAddons.Days),
                    TotalCost = tempReservation.CalculateBookingBill(objAddons.Days),
                    DepositToPay = tempReservation.CalculateDepositAmount(objAddons.Days),

                };

                tempReservation.TotalBill = tempReservation.CalculateBookingBill(objAddons.Days);
                tempReservation.Deposit = tempReservation.CalculateDepositAmount(objAddons.Days);


                Session["objAddon"] = objAddons;

                return View("PaymentBill",objPaymentDTO);
            }
            catch (Exception ex)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(ex));
                return View("~/Views/Shared/Error.cshtml");
            }


        }

        /// <summary>
        /// Gets a client token and displays the PaymentDetails.cshtml
        /// </summary>
        /// <returns>PaymentDetails.cshtml View</returns>
        [HttpGet]
        public ActionResult PaymentDetails()
        {
            //Brain tree functionality that sets up a gateway and gets a client token which is returned
            var gateway = config.GetGateway();
            var clientToken = gateway.ClientToken.generate();
            ViewBag.ClientToken = clientToken;

            return View();
        }


        /// <summary>
        /// Handles the transaction and creation of the Reservation
        /// </summary>
        /// <param name="collection">The collection passed in from the view</param>
        /// <returns>A view weather sucessfull or error</returns>
        [HttpPost]
        public ActionResult create(FormCollection collection)
        {
            try
            {

                var obj = Session["objAddon"] as AddonDetailsDTO;
                var gateway = config.GetGateway();
                Decimal amount;
                ApplicationUser user = context.Users.Find(User.Identity.GetUserId());

                //Setting up the new reservation that will be created
                Reservation newReservation = new Reservation
                {
                    Arrival = obj.CheckIn,
                    Depature = obj.CheckOut,
                    NoOfGuests = obj.NoOfGuests,
                    RoomId = obj.RoomId,
                    Room = context.Rooms.Find(obj.RoomId),

                    UserId = obj.UserId,
                    ApplicationUsers = context.Users.Find(obj.UserId),
                    BoardTypeId = obj.BoardTypeId,
                    BoardType = context.BoardTypes.Find(obj.BoardTypeId),
                };

                if (obj.SelectedExtra != null)
                {
                    foreach (int id in obj.SelectedExtra)
                    {

                        newReservation.Extras.Add(context.Extras.Where(x => x.Id == id).FirstOrDefault());
                    }
                }


                newReservation.TotalBill = newReservation.CalculateBookingBill(obj.Days);
                newReservation.Deposit = newReservation.CalculateDepositAmount(obj.Days);

                //Getting amount user to pay
                try
                {
                    amount = newReservation.Deposit;
                }
                catch (FormatException ex)
                {
                    ViewBag.Error = ("Error: " + Convert.ToString(ex));
                    return View("~/Views/Shared/Error.cshtml");
                }


                //Uses the users Id to retreive them if they have booked before
                var UserRequest = new CustomerSearchRequest().
                    Id.Is(user.Id);
                ResourceCollection<Customer> Usercollection = gateway.Customer.Search(UserRequest);



                //Gets nonce for braintrees and makes transaction requests
                var nonce = collection["payment_method_nonce"];
                var request = new TransactionRequest();




                //makes the correct type of request depending if a user has booked a room before or not
                if (Usercollection.Ids.Any())
                {
                     request = new TransactionRequest
                    {
                        Amount = amount,
                        PaymentMethodNonce = nonce,
                        CustomerId = user.Id, //user has booked before and uses their ID
                        Options = new TransactionOptionsRequest
                        {
                            SubmitForSettlement = true,
                            StoreInVault = true
                        }
                    };
                }
                else
                {
                     request = new TransactionRequest
                    {
                        Amount = amount,
                        PaymentMethodNonce = nonce,
                        Customer = new CustomerRequest //Adds customer since they have not booked before
                        {
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            Email = user.Email,
                            Phone = user.PhoneNumber,
                            Id = user.Id
                        },
                        BillingAddress = new AddressRequest
                        {
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            StreetAddress = user.AddressFirstLine,
                            ExtendedAddress = user.Street,
                            Locality = user.City,
                            PostalCode = user.PostCode
                        },
                        Options = new TransactionOptionsRequest
                        {
                            SubmitForSettlement = true,
                            StoreInVault = true
                        }
                    };
                }

                

                //Inisiates the sale
                Result<Transaction> result = gateway.Transaction.Sale(request);

                if (result.IsSuccess())
                {
                    this.AddNotification("Booked!", NotificationType.SUCCESS);
                    //Sets how much is left to pay, saves the reservation and context then returns sucess
                    newReservation.LeftToPay = (newReservation.TotalBill - newReservation.Deposit);
                    context.Reservations.Add(newReservation);
                    EmailDetails(newReservation).Wait();
                    context.SaveChanges();
                    return View("Success");

                }
                else if (result.Transaction != null)
                {
                    this.AddNotification("Payment rejected!", NotificationType.ERROR);
                    //Shows the client that their payment method has failed
                    ViewBag.Error = "Payment method has failed. Please Start Again";
                    return View("~/Views/Shared/Error.cshtml");
                }

                else
                {
                    //Handles all other errors
                    string errorMessages = "";
                    foreach (ValidationError error in result.Errors.DeepAll())
                    {
                        errorMessages += "Error: " + (int)error.Code + " - " + error.Message + "\n";
                    }
                    ViewBag.Error = errorMessages;
                    return View("~/Views/Shared/Error.cshtml");
                }
            }
            catch(Exception e)
            {
                this.AddNotification("", NotificationType.ERROR);
                ViewBag.Error = ("Error: " + Convert.ToString(e));
                return View("~/Views/Shared/Error.cshtml");
            }

        }



        #region Utility

        //public bool WorkingCharge(string id)
        //{
        //    var gateway = config.GetGateway();
        //    Customer customer = gateway.Customer.Find(id);

        //    var request = new TransactionRequest
        //    {
        //        Amount = 10m,
        //        PaymentMethodToken = customer.DefaultPaymentMethod.Token,
        //        Options = new TransactionOptionsRequest
        //        {
        //            SubmitForSettlement = true,
        //        }
        //    };

        //    Result<Transaction> result = gateway.Transaction.Sale(request);
        //    if (result.IsSuccess())
        //    {
        //        return true;
        //    }
        //    else
        //    {
        //        return false;
        //    }



            /// <summary>
            /// Used to send the Customer a confirmation email of their reservation
            /// </summary>
            /// <param name="res">The reservation to be booked</param>
            /// <returns>-</returns>
        public async Task EmailDetails(Reservation res)
        {

            var apiKey = System.Configuration.ConfigurationManager.AppSettings["mailKey"];
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(System.Configuration.ConfigurationManager.AppSettings["mailSentFrom"], "Drovers Lodge"); //gets email from the web.config
            var subject = "Drovers Inn Reservation";
            var to = new EmailAddress(res.ApplicationUsers.Email, res.ApplicationUsers.FirstName);
            var plainTextContent = " ";
            var htmlContent = "Your Reservation from the " + res.Arrival.ToShortDateString() + " till the " + res.Depature.ToShortDateString() + " for " + res.NoOfGuests.ToString() + " guests in a " + res.Room.RoomType.Room_Type + " room has been confirmed.<br/> Your deposit of  "
                            + res.Deposit.ToString() + " has been paid and this email will act as your recipt. <br/> <br/> " + "Upon the completion of your stay the reamining amount of " + (res.TotalBill - res.Deposit).ToString() + " will be required to be paid. "
                            + "Any extra charges that you occur during your stay will be added on to this total, your current addons have already been paid for however. We wish you a great stay and cannot wait for you to join us at the Drovers Inn"
                            + "<br/> <br/> Total Bill: " + res.TotalBill + "<br/> Deposit Paid: " + res.Deposit + "<br/> Left To Pay: " + res.LeftToPay;
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg).ConfigureAwait(continueOnCapturedContext:false); // .configureawait ensures that the code does not get blocked up

        }

        #endregion



    }
}