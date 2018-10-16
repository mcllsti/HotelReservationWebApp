using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Testing_IdentityDatabase_Inital_30_03.Models
{
    /// <summary>
    /// A Expanded user class for full user representation
    /// </summary>
    public class ExpandedUserDTO
    {
        [Key]
        [Display(Name = "ApplicationUser Name")]
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        public string Title { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MobNo { get; set; }

        public string AddressFirstLine { get; set; }
        public string Street { get; set; }
        public string City { get; set; }
        public string PostCode { get; set; }

        [Display(Name = "Lockout End Date")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? LockoutEndDate { get; set; }

        public int AccessFailedCount { get; set; }

        public string PhoneNumber { get; set; }

        public List<UserRoleDTO> Roles { get; set; }

    }

    /// <summary>
    /// A class that displays the role names for roles a user is in
    /// </summary>
    public class UserRolesDTO
    {
        [Key]
        [Display(Name = "Role Name")]
        public string RoleName { get; set; }
    }

    /// <summary>
    /// Class that contains the username and the rolename for a user and roles
    /// </summary>
    public class UserRoleDTO
    {
        [Key]
        [Display(Name = "ApplicationUser Name")]
        public string UserName { get; set; }

        [Display(Name = "Role Name")]
        public string RoleName { get; set; }
    }

    /// <summary>
    /// Class that represents roles
    /// </summary>
    public class RoleDTO
    {
        [Key]
        public string Id { get; set; }
        [Display(Name = "Role Name")]
        public string RoleName { get; set; }
    }

    /// <summary>
    /// Class that tracks bother users and a list of their roles
    /// </summary>
    public class UserAndRolesDTO
    {
        [Key]
        [Display(Name = "ApplicationUser Name")]
        public string UserName { get; set; }
        public List<UserRoleDTO> colUserRoleDTO { get; set; }
    }
}
