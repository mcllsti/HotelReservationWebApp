using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using PagedList;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Testing_IdentityDatabase_Inital_30_03.Controllers;
using Testing_IdentityDatabase_Inital_30_03.Models;


/// <summary>
/// Controller that deals with the user section of the admin area
/// </summary>
namespace Testing_IdentityDatabase_Inital_30_03.Areas.Admin.Controllers
{
    public class UserController : BaseController
    {
        private ApplicationUserManager _userManager;
        private ApplicationRoleManager _roleManager;

        
        /// <summary>
        /// Returns a list of all the users and allows a indevidual to search them
        /// </summary>
        /// <param name="searchStringUserNameOrEmail">The search param a user entered</param>
        /// <param name="currentFilter">The filter to be applied to list of users</param>
        /// <param name="page">The number of the current page</param>
        /// <returns>A view</returns>
        // GET: /Admin/
        [Authorize(Roles = "Administrator")]
        //public ActionResult Index(string searchStringUserNameOrEmail)
        public ActionResult Index(string searchStringUserNameOrEmail, string currentFilter, int? page)
        {
            try
            {
                int intPage = 1;
                int intPageSize = 5;
                int intTotalPageCount = 0;



                if (searchStringUserNameOrEmail != null) //if no search paramater
                {
                    intPage = 1;
                }
                else
                {
                    if (currentFilter != null)
                    {
                        searchStringUserNameOrEmail = currentFilter; //sets the search
                        intPage = page ?? 1;
                    }
                    else
                    {
                        searchStringUserNameOrEmail = "";
                        intPage = page ?? 1;
                    }
                }

                ViewBag.CurrentFilter = searchStringUserNameOrEmail;

                //Sets up a list of expanded users
                List<ExpandedUserDTO> col_UserDTO = new List<ExpandedUserDTO>();
                int intSkip = (intPage - 1) * intPageSize;

                //gets how many pages their will be
                intTotalPageCount = UserManager.Users
                    .Where(x => x.UserName.Contains(searchStringUserNameOrEmail))
                    .Count();

                //sets result var to the results of users found with the search paramas
                var result = UserManager.Users
                    .Where(x => x.UserName.Contains(searchStringUserNameOrEmail))
                    .OrderBy(x => x.UserName)
                    .Skip(intSkip)
                    .Take(intPageSize)
                    .ToList();


                
                foreach (var item in result)
                {
                    ExpandedUserDTO objUserDTO = new ExpandedUserDTO();
                    UserAndRolesDTO objUserAndRolesDTO =
                                                         GetUserAndRoles(item.UserName);
                    objUserDTO.UserName = item.UserName;
                    objUserDTO.Email = item.Email;
                    objUserDTO.LockoutEndDate = item.LockoutEndDateUtc;
                    objUserDTO.Roles = objUserAndRolesDTO.colUserRoleDTO;

                    col_UserDTO.Add(objUserDTO);
                }

                // Set the number of pages
                var _UserDTOAsIPagedList =
                    new StaticPagedList<ExpandedUserDTO>
                    (
                        col_UserDTO, intPage, intPageSize, intTotalPageCount
                        );

                return View("Index",_UserDTOAsIPagedList);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);
                List<ExpandedUserDTO> col_UserDTO = new List<ExpandedUserDTO>();

                return View("Index",col_UserDTO.ToPagedList(1, 25));
            }
        }


        
        /// <summary>
        /// Gets the create view for creating a user
        /// </summary>
        /// <returns>A View</returns>
        // GET: /Admin/Edit/Create 
        [Authorize(Roles = "Administrator")]
        // public ActionResult Create()
        public ActionResult Create()
        {
            ExpandedUserDTO objExpandedUserDTO = new ExpandedUserDTO();

            ViewBag.Roles = GetAllRolesAsSelectList();

            return View("Create", objExpandedUserDTO);
        }

        /// <summary>
        /// Gets the post of the create view and creates a indevidual
        /// </summary>
        /// <param name="paramExpandedUserDTO">The Form input</param>
        /// <returns>A view</returns>
        // PUT: /Admin/Create
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        // public ActionResult Create(ExpandedUserDTO paramExpandedUserDTO)
        public ActionResult Create(ExpandedUserDTO paramExpandedUserDTO)
        {
            try
            {
                if (paramExpandedUserDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                var Email = paramExpandedUserDTO.Email.Trim();
                var UserName = paramExpandedUserDTO.Email.Trim();
                var Password = paramExpandedUserDTO.Password.Trim();

                if (Email == "")
                {
                    throw new Exception("No Email");
                }

                if (Password == "")
                {
                    throw new Exception("No Password");
                }

                // UserName is LowerCase of the Email
                UserName = Email.ToLower();

                // Create user
                var objNewAdminUser = new ApplicationUser { UserName = UserName, Email = Email };
                var AdminUserCreateResult = UserManager.Create(objNewAdminUser, Password);

                if (AdminUserCreateResult.Succeeded == true)
                {
                    string strNewRole = Convert.ToString(Request.Form["Roles"]);

                    if (strNewRole != "0")
                    {
                        // Put user in role
                        UserManager.AddToRole(objNewAdminUser.Id, strNewRole);
                    }

                    return Redirect("Index");
                }
                else
                {//If failed create
                    ViewBag.Roles = GetAllRolesAsSelectList();
                    ModelState.AddModelError(string.Empty,
                        "Error: Failed to create the user. Check password requirements.");
                    return View(paramExpandedUserDTO);
                }
            }
            catch (Exception ex)
            {
                ViewBag.Roles = GetAllRolesAsSelectList();
                ModelState.AddModelError(string.Empty, "Error: " + ex);
                return View("Create");
            }
        }


        /// <summary>
        /// Returns the edit user view
        /// </summary>
        /// <param name="UserName">Users Username</param>
        /// <returns>View for edit user</returns>
        // GET: /Admin/Edit/TestUser 
        [Authorize(Roles = "Administrator")]
        // public ActionResult EditUser(string UserName)
        public ActionResult EditUser(string UserName)
        {
            if (UserName == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            ExpandedUserDTO objExpandedUserDTO = GetUser(UserName); //calls get user to retreive and set user
            if (objExpandedUserDTO == null)
            {
                return HttpNotFound();
            }
            return View("EditUser", objExpandedUserDTO);
        }

        /// <summary>
        /// Returns the lockout user view
        /// </summary>
        /// <param name="UserName">User Username</param>
        /// <returns>LockoutUser View</returns>
        // GET: /Admin/LockoutUser 
        [Authorize(Roles = "Administrator")]
        // public ActionResult Lockout(string UserName)
        public ActionResult LockoutUser(string UserName)
        {
            if (UserName == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            ExpandedUserDTO objExpandedUserDTO = GetUser(UserName);//calls get user to retreive and set user
            if (objExpandedUserDTO == null)
            {
                return HttpNotFound();
            }
            return View("LockoutUser", objExpandedUserDTO);
        }

        /// <summary>
        /// Lockouts the specified user
        /// </summary>
        /// <param name="paramExpandedUserDTO">ExpandedUserDTo of the user to be lockedout</param>
        /// <returns>Edit User View</returns>
        // PUT: /Admin/EditUser
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        // public ActionResult EditUser(ExpandedUserDTO paramExpandedUserDTO)
        public ActionResult LockoutUser(ExpandedUserDTO paramExpandedUserDTO)
        {
            try
            {
                if (paramExpandedUserDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                ApplicationUser result = UserManager.FindByName(paramExpandedUserDTO.UserName); //finds user

                result.LockoutEndDateUtc = paramExpandedUserDTO.LockoutEndDate;//locks them out
                UserManager.Update(result);

                return View("EditUser", GetUser(paramExpandedUserDTO.UserName));
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);
                return View("EditUser", GetUser(paramExpandedUserDTO.UserName));
            }
        }

        /// <summary>
        /// Unlocks a lockedout user
        /// </summary>
        /// <param name="UserName">User Username</param>
        /// <returns>Edit User View</returns>
        // GET: /Admin/LockoutUser 
        [Authorize(Roles = "Administrator")]
        // public ActionResult Lockout(string UserName)
        public ActionResult UnlockUser(string UserName)
        {
            try
            {
                if (UserName == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                ApplicationUser result = UserManager.FindByName(UserName); //Finds user
                result.LockoutEndDateUtc = null; // Unlocks them
                UserManager.Update(result);

                return View("EditUser", GetUser(UserName));
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);
                return View("EditUser", GetUser(UserName));
            }
        }


        /// <summary>
        /// POST edit user that edits a user details
        /// </summary>
        /// <param name="paramExpandedUserDTO">Input form of the user deatils</param>
        /// <returns>View</returns>
        // PUT: /Admin/EditUser
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        // public ActionResult EditUser(ExpandedUserDTO paramExpandedUserDTO)
        public ActionResult EditUser(ExpandedUserDTO paramExpandedUserDTO)
        {
            try
            {
                if (paramExpandedUserDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                ExpandedUserDTO objExpandedUserDTO = UpdateDTOUser(paramExpandedUserDTO); //Calls update user to edit user

                if (objExpandedUserDTO == null)
                {
                    return HttpNotFound();
                }

                return Redirect("Index");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);
                return View("EditUser", GetUser(paramExpandedUserDTO.UserName));
            }
        }

        /// <summary>
        /// Deletes a User
        /// </summary>
        /// <param name="UserName">User Username</param>
        /// <returns>View</returns>
        // DELETE: /Admin/DeleteUser
        [Authorize(Roles = "Administrator")]
        public ActionResult DeleteUser(string UserName)
        {
            try
            {
                if (UserName == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                if (UserName.ToLower() == this.User.Identity.Name.ToLower()) //Cannot delete yourself
                {
                    ModelState.AddModelError(
                        string.Empty, "Error: Cannot delete the current user");

                    return View("EditUser");
                }

                ExpandedUserDTO objExpandedUserDTO = GetUser(UserName); //Gets user

                if (objExpandedUserDTO == null)
                {
                    return HttpNotFound();
                }
                else
                {
                    DeleteUser(objExpandedUserDTO); //Calls delete user to delete user
                }

                return Redirect("Index");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);
                return View("EditUser", GetUser(UserName));
            }
        }

        /// <summary>
        /// Gets a list of user roles and will allow indevidual to edit htem
        /// </summary>
        /// <param name="UserName">User Username</param>
        /// <returns>View iwth list of roles</returns>
        // GET: /Admin/EditRoles/TestUser 
        [Authorize(Roles = "Administrator")]
        // ActionResult EditRoles(string UserName)
        public ActionResult EditRoles(string UserName)
        {
            if (UserName == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }

            UserName = UserName.ToLower();

            // Check that we have an actual user
            ExpandedUserDTO objExpandedUserDTO = GetUser(UserName);

            if (objExpandedUserDTO == null)
            {
                return HttpNotFound();
            }

            UserAndRolesDTO objUserAndRolesDTO =
                GetUserAndRoles(UserName); //gets the user and roles

            return View("EditRoles", objUserAndRolesDTO);
        }

        /// <summary>
        /// POST edit roles that will edit the roles of a user
        /// </summary>
        /// <param name="paramUserAndRolesDTO">The form input of user and roles to update</param>
        /// <returns>View</returns>
        // PUT: /Admin/EditRoles/TestUser 
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        // public ActionResult EditRoles(UserAndRolesDTO paramUserAndRolesDTO)
        public ActionResult EditRoles(UserAndRolesDTO paramUserAndRolesDTO)
        {
            try
            {
                if (paramUserAndRolesDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                string UserName = paramUserAndRolesDTO.UserName; 
                string strNewRole = Convert.ToString(Request.Form["AddRole"]);

                if (strNewRole != "No Roles Found")
                {
                    // Go get the ApplicationUser
                    ApplicationUser user = UserManager.FindByName(UserName);

                    // Put user in role
                    UserManager.AddToRole(user.Id, strNewRole);
                }

                ViewBag.AddRole = new SelectList(RolesUserIsNotIn(UserName));

                UserAndRolesDTO objUserAndRolesDTO =
                    GetUserAndRoles(UserName);

                return View("EditRoles", objUserAndRolesDTO);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);
                return View("EditRoles");
            }
        }

        /// <summary>
        /// Delete role function to delete role of user
        /// </summary>
        /// <param name="UserName">Users Username</param>
        /// <param name="RoleName">Role name to delete</param>
        /// <returns>View</returns>
        // DELETE: /Admin/DeleteRole?UserName="TestUser&RoleName=Administrator
        [Authorize(Roles = "Administrator")]
        // public ActionResult DeleteRole(string UserName, string RoleName)
        public ActionResult DeleteRole(string UserName, string RoleName)
        {
            try
            {
                if ((UserName == null) || (RoleName == null))
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                UserName = UserName.ToLower();

                // Check that we have an actual user
                ExpandedUserDTO objExpandedUserDTO = GetUser(UserName); //Gets user

                if (objExpandedUserDTO == null)
                {
                    return HttpNotFound();
                }

                if (UserName.ToLower() ==
                    this.User.Identity.Name.ToLower() && RoleName == "Administrator") //Does not allow to delete admin rank and current user rank
                {
                    ModelState.AddModelError(string.Empty,
                        "Error: Cannot delete Administrator Role for the current user");
                }

                // Go get the ApplicationUser
                ApplicationUser user = UserManager.FindByName(UserName);
                // Remove ApplicationUser from role
                UserManager.RemoveFromRoles(user.Id, RoleName);
                UserManager.Update(user);

                ViewBag.AddRole = new SelectList(RolesUserIsNotIn(UserName));

                return RedirectToAction("EditRoles", new { UserName = UserName });
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);

                ViewBag.AddRole = new SelectList(RolesUserIsNotIn(UserName));

                UserAndRolesDTO objUserAndRolesDTO =
                    GetUserAndRoles(UserName);

                return View("EditRoles", objUserAndRolesDTO);
            }
        }


        /// <summary>
        /// Returns a view with all the roles
        /// </summary>
        /// <returns>View with model</returns>
        // GET: /Admin/ViewAllRoles
        [Authorize(Roles = "Administrator")]
        // public ActionResult ViewAllRoles()
        public ActionResult ViewAllRoles()
        {
            var roleManager =
                new RoleManager<IdentityRole>
                (
                    new RoleStore<IdentityRole>(new ApplicationDbContext()) //gets roles with Rolemanager
                    );

            List<RoleDTO> colRoleDTO = (from objRole in roleManager.Roles
                                        select new RoleDTO //Inserts them into a list of RoleDTO view model
                                        {
                                            Id = objRole.Id,
                                            RoleName = objRole.Name
                                        }).ToList();

            return View("ViewAllRoles", colRoleDTO);
        }


        /// <summary>
        /// Gets the add role form
        /// </summary>
        /// <returns>View</returns>
        // GET: /Admin/AddRole
        [Authorize(Roles = "Administrator")]
        // public ActionResult AddRole()
        public ActionResult AddRole()
        {
            RoleDTO objRoleDTO = new RoleDTO();

            return View("AddRole", objRoleDTO);
        }

        /// <summary>
        /// POST adds the role to be added
        /// </summary>
        /// <param name="paramRoleDTO">ROLEDTO to be added</param>
        /// <returns>View</returns>
        // PUT: /Admin/AddRole
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        // public ActionResult AddRole(RoleDTO paramRoleDTO)
        public ActionResult AddRole(RoleDTO paramRoleDTO)
        {
            try
            {
                if (paramRoleDTO == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                var RoleName = paramRoleDTO.RoleName.Trim();

                if (RoleName == "")
                {
                    throw new Exception("No RoleName");
                }

                // Create Role
                var roleManager =
                    new RoleManager<IdentityRole>(
                        new RoleStore<IdentityRole>(new ApplicationDbContext())
                        );

                if (!roleManager.RoleExists(RoleName))
                {
                    roleManager.Create(new IdentityRole(RoleName));
                }

                return Redirect("ViewAllRoles");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);
                return View("AddRole");
            }
        }

        /// <summary>
        /// Deletes a role
        /// </summary>
        /// <param name="RoleName">Role to be deleted</param>
        /// <returns>View</returns>
        // DELETE: /Admin/DeleteUserRole?RoleName=TestRole
        [Authorize(Roles = "Administrator")]
        // public ActionResult DeleteUserRole(string RoleName)
        public ActionResult DeleteUserRole(string RoleName)
        {
            try
            {
                if (RoleName == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                if (RoleName.ToLower() == "administrator") //Makes so you cannot delete admin role
                {
                    throw new Exception(String.Format("Cannot delete {0} Role.", RoleName));
                }

                var roleManager =
                    new RoleManager<IdentityRole>(
                        new RoleStore<IdentityRole>(new ApplicationDbContext()));

                var UsersInRole = roleManager.FindByName(RoleName).Users.Count();
                if (UsersInRole > 0)
                {
                    throw new Exception( //Does not allow a role to be deleted if it has users in it
                        String.Format(
                            "Canot delete {0} Role because it still has users.",
                            RoleName)
                            );
                }

                var objRoleToDelete = (from objRole in roleManager.Roles
                                       where objRole.Name == RoleName
                                       select objRole).FirstOrDefault();
                if (objRoleToDelete != null)
                {
                    roleManager.Delete(objRoleToDelete);
                }
                else
                {
                    throw new Exception(
                        String.Format( //Checks if it exits and if not returns exception
                            "Canot delete {0} Role does not exist.",
                            RoleName)
                            );
                }

                List<RoleDTO> colRoleDTO = (from objRole in roleManager.Roles
                                            select new RoleDTO
                                            {
                                                Id = objRole.Id,
                                                RoleName = objRole.Name
                                            }).ToList();

                return View("ViewAllRoles", colRoleDTO);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, "Error: " + ex);

                var roleManager =
                    new RoleManager<IdentityRole>(
                        new RoleStore<IdentityRole>(new ApplicationDbContext()));

                List<RoleDTO> colRoleDTO = (from objRole in roleManager.Roles
                                            select new RoleDTO
                                            {
                                                Id = objRole.Id,
                                                RoleName = objRole.Name
                                            }).ToList();

                return View("ViewAllRoles", colRoleDTO);
            }
        }



        // Utility

            /// <summary>
            /// Instilised the UserManager
            /// </summary>
        // public ApplicationUserManager UserManager
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ??
                    HttpContext.GetOwinContext()
                    .GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        /// <summary>
        /// Instilised the rolemanager
        /// </summary>
        // public ApplicationRoleManager RoleManager
        public ApplicationRoleManager RoleManager
        {
            get
            {
                return _roleManager ??
                    HttpContext.GetOwinContext()
                    .GetUserManager<ApplicationRoleManager>();
            }
            private set
            {
                _roleManager = value;
            }
        }

        /// <summary>
        /// Gets all the roles as a select list
        /// </summary>
        /// <returns>A List of select list items</returns>
        // private List<SelectListItem> GetAllRolesAsSelectList()
        private List<SelectListItem> GetAllRolesAsSelectList()
        {
            List<SelectListItem> SelectRoleListItems = //Sets the select list
                new List<SelectListItem>();

            var roleManager =
                new RoleManager<IdentityRole>(
                    new RoleStore<IdentityRole>(new ApplicationDbContext()));

            var colRoleSelectList = roleManager.Roles.OrderBy(x => x.Name).ToList();

            SelectRoleListItems.Add(
                new SelectListItem //Adds the roles to the select list
                {
                    Text = "Select",
                    Value = "0"
                });

            foreach (var item in colRoleSelectList)
            {
                SelectRoleListItems.Add(
                    new SelectListItem
                    {
                        Text = item.Name.ToString(),
                        Value = item.Name.ToString()
                    });
            }

            return SelectRoleListItems;
        }


        /// <summary>
        /// Gets a user and details
        /// </summary>
        /// <param name="paramUserName">username of user to find</param>
        /// <returns>an ExpandedUserDTO of the found user</returns>
        // private ExpandedUserDTO GetUser(string paramUserName)
        private ExpandedUserDTO GetUser(string paramUserName)
        {
            ExpandedUserDTO objExpandedUserDTO = new ExpandedUserDTO();

            var result = UserManager.FindByName(paramUserName); //Finds user using username

            // If we could not find the user, throw an exception
            if (result == null) throw new Exception("Could not find the ApplicationUser");

            //Set details
            objExpandedUserDTO.UserName = result.UserName;
            objExpandedUserDTO.Email = result.Email;
            objExpandedUserDTO.LockoutEndDate = result.LockoutEndDateUtc;
            objExpandedUserDTO.AccessFailedCount = result.AccessFailedCount;
            objExpandedUserDTO.PhoneNumber = result.PhoneNumber;

            objExpandedUserDTO.FirstName = result.FirstName;
            objExpandedUserDTO.LastName = result.LastName;
            objExpandedUserDTO.Title = result.Title;
            objExpandedUserDTO.MobNo = result.MobNo;

            objExpandedUserDTO.AddressFirstLine = result.AddressFirstLine;
            objExpandedUserDTO.Street = result.Street;
            objExpandedUserDTO.City = result.City;
            objExpandedUserDTO.PostCode = result.PostCode;

            return objExpandedUserDTO;
        }

        /// <summary>
        /// Updates user using input
        /// </summary>
        /// <param name="paramExpandedUserDTO">ExpandeduserDTO of new deatils to update</param>
        /// <returns>an ExpandedUserDTO of the updated user</returns>
        // private ExpandedUserDTO UpdateDTOUser(ExpandedUserDTO objExpandedUserDTO)
        private ExpandedUserDTO UpdateDTOUser(ExpandedUserDTO paramExpandedUserDTO)
        {
            ApplicationUser result =
                UserManager.FindByName(paramExpandedUserDTO.UserName);

            // If we could not find the user, throw an exception
            if (result == null)
            {
                throw new Exception("Could not find the ApplicationUser");
            }

            //Updates Details
            result.Email = paramExpandedUserDTO.Email;
            result.FirstName = paramExpandedUserDTO.FirstName;
            result.LastName = paramExpandedUserDTO.LastName;
            result.Title = paramExpandedUserDTO.Title;
            result.MobNo = paramExpandedUserDTO.MobNo;
            result.AddressFirstLine = paramExpandedUserDTO.AddressFirstLine;
            result.Street = paramExpandedUserDTO.Street;
            result.City = paramExpandedUserDTO.City;
            result.PostCode = paramExpandedUserDTO.PostCode;



            // Lets check if the account needs to be unlocked
            if (UserManager.IsLockedOut(result.Id))
            {
                // Unlock user
                UserManager.ResetAccessFailedCountAsync(result.Id);
            }

            UserManager.Update(result);

            // Was a password sent across?
            if (!string.IsNullOrEmpty(paramExpandedUserDTO.Password))
            {
                // Remove current password
                var removePassword = UserManager.RemovePassword(result.Id);
                if (removePassword.Succeeded)
                {
                    // Add new password
                    var AddPassword =
                        UserManager.AddPassword(
                            result.Id,
                            paramExpandedUserDTO.Password
                            );

                    if (AddPassword.Errors.Count() > 0)
                    {
                        throw new Exception(AddPassword.Errors.FirstOrDefault());
                    }
                }
            }

            return paramExpandedUserDTO;
        }

        /// <summary>
        /// Deletes a User
        /// </summary>
        /// <param name="paramExpandedUserDTO">ExpandedUserDTO of the user to be deleted</param>
        // private void DeleteUser(ExpandedUserDTO paramExpandedUserDTO)
        private void DeleteUser(ExpandedUserDTO paramExpandedUserDTO)
        {
            ApplicationUser user =
                UserManager.FindByName(paramExpandedUserDTO.UserName);

            // If we could not find the user, throw an exception
            if (user == null)
            {
                throw new Exception("Could not find the ApplicationUser");
            }

            UserManager.RemoveFromRoles(user.Id, UserManager.GetRoles(user.Id).ToArray()); //removes them form roles and deletes them
            UserManager.Update(user);
            UserManager.Delete(user);
        }

        /// <summary>
        /// Gets a user and thier roles
        /// </summary>
        /// <param name="UserName">User username</param>
        /// <returns>a UserAndRolesDTO of user with their roles</returns>
        // private UserAndRolesDTO GetUserAndRoles(string UserName)
        private UserAndRolesDTO GetUserAndRoles(string UserName)
        {
            // Go get the ApplicationUser
            ApplicationUser user = UserManager.FindByName(UserName);

            List<UserRoleDTO> colUserRoleDTO =
                (from objRole in UserManager.GetRoles(user.Id)
                 select new UserRoleDTO
                 {
                     RoleName = objRole,
                     UserName = UserName
                 }).ToList();

            if (colUserRoleDTO.Count() == 0)
            {
                colUserRoleDTO.Add(new UserRoleDTO { RoleName = "No Roles Found" });
            }

            ViewBag.AddRole = new SelectList(RolesUserIsNotIn(UserName));

            // Create UserRolesAndPermissionsDTO
            UserAndRolesDTO objUserAndRolesDTO =
                new UserAndRolesDTO();
            objUserAndRolesDTO.UserName = UserName;
            objUserAndRolesDTO.colUserRoleDTO = colUserRoleDTO;
            return objUserAndRolesDTO;
        }


        /// <summary>
        /// Returns the roles that a user is not part of
        /// </summary>
        /// <param name="UserName">user Username</param>
        /// <returns>A list of strings of the names of roles a user is not in</returns>
        // private List<string> RolesUserIsNotIn(string UserName)
        private List<string> RolesUserIsNotIn(string UserName)
        {
            // Get roles the user is not in
            var colAllRoles = RoleManager.Roles.Select(x => x.Name).ToList();

            // Go get the roles for an individual
            ApplicationUser user = UserManager.FindByName(UserName);

            // If we could not find the user, throw an exception
            if (user == null)
            {
                throw new Exception("Could not find the ApplicationUser");
            }

            var colRolesForUser = UserManager.GetRoles(user.Id).ToList();
            var colRolesUserInNotIn = (from objRole in colAllRoles
                                       where !colRolesForUser.Contains(objRole)
                                       select objRole).ToList();

            if (colRolesUserInNotIn.Count() == 0)
            {
                colRolesUserInNotIn.Add("No Roles Found");
            }

            return colRolesUserInNotIn;
        }

    }
}